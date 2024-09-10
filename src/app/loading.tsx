export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-12 pb-12">
      <div className="py-24 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                Targon Validator Status
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Your hub for validator stats!
              </p>
              <div className="mt-8 flex justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-gray-50"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
