export default function Home() {
  return (
    <div 
      className="min-h-screen w-screen px-4 flex flex-col"
      style={{
        backgroundImage: `url('/Bg1.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
    
      <nav className="mx-auto mt-6 w-[95%] max-w-7xl bg-black/60 backdrop-blur-md shadow-lg rounded-xl px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Kind Of Draw</div>
        <div className="space-x-4">
          <button className="text-gray-200 hover:text-white hover:font-semibold font-medium">Sign In</button>
          <button className="bg-indigo-800 text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black hover:font-semibold">Sign Up</button>
        </div>
      </nav>

      <div className="mt-26 text-center text-white px-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight">
          Draw Ideas. <br />
          Share Visions <br />
          Compete Creatively
        </h1>
        <p className="mt-6 text-2xl text-white max-w-2xl mx-auto">
          Join now and pretend to be an artist like the rest of us
        </p>
        <div className="mt-8">
          <button 
            className="bg-indigo-800 text-white text-lg font-semibold px-6 py-3 rounded-lg transform transition-transform duration-300 hover:bg-gray-200 hover:text-black hover:scale-105">
            Start creating chaos
          </button>
        </div>
      </div>

      

    </div>
  );
}