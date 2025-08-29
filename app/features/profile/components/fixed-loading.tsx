const FixedLoading = () => {
    return (
        <div className="fixed top-0 left-0 bottom-0 right-0 bg-background/5 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="w-12 h-12 rounded-full border-8 border-primary border-r-transparent animate-spin"></div>
        </div>
    );
}

export default FixedLoading;