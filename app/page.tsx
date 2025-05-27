'use client'
import { motion, cubicBezier } from 'framer-motion';

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
      <div className='
          flex flex-col h-screen w-full 
          bg-cover bg-[url("/bg5.jpg")] 
          items-center justify-center
          bg-[69%_center] sm:bg-center 
          transition-[background-position] duration-500 ease-in-out
        '
      >
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
      <div className="flex h-screen w-full">
      </div>
    </div>
  );
}
