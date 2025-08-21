// src/components/UI/LoadingOverlay.jsx
export default function LoadingOverlay() {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="loading-heart"></div>
                <h2>Spinning up preview...</h2>
            </div>
        </div>
    );
}