export default function Dashboard() {
  return (
    <div 
      className="min-h-screen w-screen px-4 py-6"
      style={{
        backgroundImage: `url('/Bg1.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-5xl mx-auto bg-black/60 backdrop-blur-md p-6 rounded-xl shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-4">Your Chat Dashboard</h1>
        <div className="space-y-4">
          <button className="w-full bg-indigo-800 p-4 rounded-md hover:bg-gray-200 hover:text-black font-semibold">
            Create a Room
          </button>
          <input type="text" placeholder="Enter room slug to join" className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600" />
          <button className="w-full bg-indigo-800 p-3 rounded-md hover:bg-gray-200 hover:text-black font-semibold">
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
