export const GettingStarted = () => (
  <section className="bg-gray-50 py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">Ready to Start Your Financial Journey?</h2>
          <p className="mb-8 text-xl text-gray-600">
            Getting started with Pocket Penny is simple. Choose your learning path, set your goals, and begin building
            lasting financial knowledge.
          </p>

          <div className="mb-8 space-y-6">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Tell us about your financial goals and current knowledge level.",
              },
              {
                step: "2",
                title: "Choose Your Tracks",
                description: "Select from our 10 specialized learning modules based on your interests.",
              },
              {
                step: "3",
                title: "Start Learning",
                description: "Begin your personalized financial education journey with interactive tools.",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h4 className="mb-1 text-lg font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="transform rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700">
            Get Started Free
          </button>
        </div>

        <div className="flex justify-center">
          <div className="relative h-96 w-64 rounded-3xl bg-gray-800 p-4">
            <div className="flex h-full flex-col rounded-2xl bg-white p-4">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Pocket Penny</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Today's Lesson</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 w-3/5 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Savings Goal</span>
                    <span className="text-lg font-bold text-green-600">$2,450</span>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Learning Streak</span>
                    <span className="text-sm font-bold text-orange-500">🔥 12 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
