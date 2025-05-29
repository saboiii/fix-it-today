'use client'
import Featured from '@/components/Featured';
import { motion, cubicBezier } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  const text = "Fix It Today®";
  const letters = Array.from(text);
  
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.035, delayChildren: 0.005 * i },
    }),
  };

  const letterVariants = {
    hidden: {
      y: "100%",
      transition: { type: "tween", ease: cubicBezier(.18, .64, .0, 1.0), duration: 0.8 },
    },
    visible: {
      y: "0%",
      transition: { type: "tween", ease: cubicBezier(.18, .64, .0, 1.0), duration: 0.8 },
    },
  };

  return (
    <div className='flex flex-col w-screen'>
      <div className="relative flex flex-col h-screen w-full items-center justify-center overflow-hidden">
        <Image
          src="/bg5.jpg"
          alt="Background"
          fill
          priority
          className="
            object-cover
            object-[69%_center] sm:object-center
            z-0
            transition-[object-position] duration-500 ease-in-out
          "
          sizes="100vw"
        />
        <div className="relative z-10 flex flex-col items-center w-full text-[#eae9fc]">
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            aria-label={text}
          >
            {letters.map((letter, index) => (
              <div
                key={index}
                className='inline-block overflow-hidden relative leading-none h-[38px] md:h-[56px]'
              >
                <motion.span
                  variants={letterVariants}
                  className='block'
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              </div>
            ))}
          </motion.h1>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}>
            3D printing and modeling services
          </motion.h3>
        </div>
      </div>
      <Featured/>
    </div>
  );
}
