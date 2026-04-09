'use client'

import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { setIsRouteLoading } = useAppContext();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 text-gray-500 md:grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr] md:px-16 lg:px-20">
        <div className="max-w-xl">
          <Image className="w-28 md:w-32" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm leading-7">
            KawilMart is your trusted online marketplace in Northern Uganda.
            We now support fashion, beauty, electronics, home essentials, and more at affordable prices,
            all from local sellers and delivered with convenience right to your community.
          </p>
        </div>

        <div className="w-full">
          <div>
            <h2 className="mb-5 font-medium text-gray-900">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <Link className="hover:underline transition" href="/" onClick={() => setIsRouteLoading(true)}>Home</Link>
              </li>
              <li>
                <Link className="hover:underline transition" href="/about" onClick={() => setIsRouteLoading(true)}>About us</Link>
              </li>
              <li>
                <a className="hover:underline transition" href="mailto:kawilmart@gmail.com">Contact us</a>
              </li>
              <li>
                <Link className="hover:underline transition" href="/legal#terms" onClick={() => setIsRouteLoading(true)}>Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link className="hover:underline transition" href="/legal#privacy" onClick={() => setIsRouteLoading(true)}>Privacy policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full">
          <div>
            <h2 className="mb-5 font-medium text-gray-900">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>+256 767-934-191</p>
              <p>kawilmart@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-500/20 px-6 py-4 md:px-16 lg:px-20">
        <p className="mx-auto max-w-7xl text-center text-xs md:text-sm">
          Copyright {currentYear} © DanceCode &amp; KawilMart. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
