
const Loading = ({ size = "36px" }: { size?: string }) => {
    return (
        <div
            style={{ width: size, height: size }}
            className="rounded-full border-4 border-foreground border-r-transparent animate-spin"
        >
        </div>
    );
};

export default Loading;