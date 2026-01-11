const GuestLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-zinc-950 font-sans selection:bg-orange-500 selection:text-white">
            <div className="w-full max-w-md px-8 py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
                <div className="flex justify-center mb-8">
                    <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                        Mandor<span className="text-orange-600">.</span>
                    </span>
                </div>
                {children}
            </div>
            
            <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-600">
                &copy; {new Date().getFullYear()} Mandor Project. All rights reserved.
            </div>
        </div>
    );
};

export default GuestLayout;
