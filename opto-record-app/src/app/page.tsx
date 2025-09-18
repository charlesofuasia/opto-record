import Nav from "./components/Nav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
    
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-r from-blue-100 to-blue-50">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-blue-600">Opto Records</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-6">
          A modern patient management solution for small clinics in developing
          countries. Secure, fast, and easy to use across mobile and desktop.
        </p>
        <div className="flex space-x-4">
          <a
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
          >
            Get Started
          </a>
          <a
            href="/about"
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg shadow hover:bg-gray-100"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-12">
          Features at a Glance
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-600 mb-2">
              Secure Access
            </h3>
            <p className="text-gray-600">
              Authentication with role-based access ensures privacy and data
              security.
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-600 mb-2">
              Patient Management
            </h3>
            <p className="text-gray-600">
              Store and retrieve patient information quickly from any device.
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-600 mb-2">
              Appointments & Alerts
            </h3>
            <p className="text-gray-600">
              Schedule appointments with reminders and birthday notifications.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
