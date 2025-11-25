"use client";

import Header from "./components/Header";
import Hero from "./components/HeroSection";
import Feature from "./components/Feature";
import Pricing from "./components/Pricing";
import About from "./components/About";
import CTA from "./components/CTA";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {

  return (
    <>
      <Header />
      <Hero />
      <Feature />
      <Pricing />
      <About />
      <CTA />
      <Contact />
      <Footer />
    </>
  );
}
