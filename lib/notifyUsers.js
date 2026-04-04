import User from "@/models/User";
import { createNotificationEmail, sendEmail } from "@/lib/email";
import { resolveNotificationRecipients } from "@/lib/clerkUserSync";

const groupByUserId = (entries) => {
    const grouped = new Map();

    for (const entry of entries) {
        if (!entry?.userId || !entry?.notification) {
            continue;
        }

        const existing = grouped.get(entry.userId) || [];
        existing.push(entry);
        grouped.set(entry.userId, existing);
    }

    return grouped;
};

export const notifyUsers = async (entries = []) => {
    const groupedEntries = groupByUserId(entries);
    const userIds = [...groupedEntries.keys()];

    if (userIds.length === 0) {
        return { success: true, count: 0 };
    }

    const userMap = await resolveNotificationRecipients(userIds);

    await User.bulkWrite(
        userIds.map((userId) => ({
            updateOne: {
                filter: { _id: userId },
                update: {
                    $push: {
                        notifications: {
                            $each: groupedEntries.get(userId).map((entry) => entry.notification),
                        },
                    },
                },
            },
        }))
    );

    await Promise.allSettled(
        userIds.flatMap((userId) => {
            const recipient = userMap.get(String(userId));
            const email = recipient?.email;
            const sendableEntries = groupedEntries.get(userId).filter((entry) => entry?.sendEmail !== false);

            if (!email || sendableEntries.length === 0) {
                return [];
            }

            return sendableEntries.map(async (entry) => {
                const emailPayload = createNotificationEmail({
                    recipientName: recipient?.name || 'there',
                    title: entry.emailTitle || entry.notification.title,
                    message: entry.emailMessage || entry.notification.message,
                    ctaLabel: entry.ctaLabel,
                    ctaPath: entry.ctaPath,
                    details: entry.emailDetails,
                });

                const result = await sendEmail({
                    to: email,
                    subject: emailPayload.subject,
                    html: emailPayload.html,
                    text: emailPayload.text,
                });

                if (!result?.success && !result?.skipped) {
                    console.error(`Failed to send notification email to ${email}: ${result?.message || result?.reason || 'Unknown error'}`);
                }
            });
        })
    );

    return { success: true, count: userIds.length };
};
