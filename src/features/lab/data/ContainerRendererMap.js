export const CONTAINER_UI_MAP = {
  beaker: {
    svgViewBox: "0 0 100 125",
    svgPaths: [
      { d: "M 10 10 L 10 90 Q 10 95 15 95 L 65 95 Q 70 95 70 90 L 70 10 M 5 10 L 15 10 M 65 10 L 75 10", stroke: "rgba(255,255,255,0.9)", strokeWidth: "4" },
      { d: "M 10 10 L 10 90 Q 10 95 15 95 L 65 95 Q 70 95 70 90 L 70 10 M 5 10 L 15 10 M 65 10 L 75 10", stroke: "#94a3b8", strokeWidth: "2" }
    ],
    liquidStyle: {
      bottom: "6px",
      left: "15px",
      right: "15px",
      borderRadius: "0 0 5px 5px"
    },
    gasOrigin: "55%", // bottom: 55%
    bubbles: [
      { className: "w-1.5 h-1.5 bottom-1 left-2", animationDelay: "0ms" },
      { className: "w-2 h-2 bottom-2 left-6", animationDelay: "300ms" },
      { className: "w-1.5 h-1.5 bottom-0 right-3", animationDelay: "600ms" },
      { className: "w-2.5 h-2.5 bottom-2 right-6", animationDelay: "100ms" }
    ]
  },
  test_tube: {
    svgViewBox: "0 0 50 150",
    svgPaths: [
      { d: "M 10 10 L 10 110 A 10 10 0 0 0 30 110 L 30 10 M 5 10 L 15 10 M 25 10 L 35 10", stroke: "#94a3b8", strokeWidth: "2" }
    ],
    liquidStyle: {
      bottom: "2px",
      left: "14px",
      right: "14px",
      borderRadius: "0 0 9999px 9999px" // using 9999px for rounded-b-full
    },
    gasOrigin: "45%", // bottom: 45%
    bubbles: [
      { className: "w-1 h-1 bottom-1 left-2.5", animationDelay: "0ms" },
      { className: "w-1.5 h-1.5 bottom-2 right-2.5", animationDelay: "400ms" }
    ]
  }
};
