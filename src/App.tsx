import {useEffect} from 'react';
import {Apps} from './components/Apps';
import {Footer, Header} from './components/Chrome';
import {Moonrise} from './components/Moonrise';
import {Next} from './components/Next';
import {Reel} from './components/Reel';
import {useReducedMotion} from './hooks/useReducedMotion';
import {followLocationHash, startScroll} from './lib/scroll';

export default function App() {
  const reduced = useReducedMotion();
  useEffect(() => {
    const stop = startScroll(reduced);
    const unfollow = followLocationHash();
    return () => {
      unfollow();
      stop();
    };
  }, [reduced]);

  return (
    <>
      <Header />
      <main>
        <Moonrise />
        <Apps />
        <Reel />
        <Next />
      </main>
      <Footer />
    </>
  );
}
