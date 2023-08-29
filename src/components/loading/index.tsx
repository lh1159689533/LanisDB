import './index.less';

export default function Loading() {
  return (
    <div className="loading-wapper">
      <div className="container">
        {new Array(20).fill(1).map((_, index) => (
          <span style={{ '--i': index + 1 } as any}></span>
        ))}
      </div>
    </div>
  );
}
