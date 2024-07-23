import { useEffect, useRef, useState } from 'react';

import './index.less';

interface IReSizeProps {
  isMax?: boolean;
  min?: number;
  max?: number;
  type?: string;
  style?: any;
  onResize?: (size: number) => void;
  onResizeStart?: () => void;
  onResizeStop?: () => void;
}

/**
 * @description 鼠标按下(mouseDown)时，监听mousemove事件，当鼠标x坐标发生变化时，调用dragWidth并将x坐标值作为第一个参数
 * @param onResize 是一个Function，用于改变容器宽/高，实现拖动鼠标改变容器宽度的效果，必填项
 * @param isMax 是否最大，当父组件使用全屏按钮时，用于改变direction的值，以改变样式显示
 * @param min 最小值，非必填，默认0
 * @param max 最大值，非必填
 * @param type 类型: col 改变宽度 默认值, row 改变高度
 * @example <div width={col}><ReSize onResize={col => setWid(col)} type='col' /></div>
 */
export default function ReSize({
  isMax = false,
  min = 0,
  max,
  type = 'col',
  style,
  onResize,
  onResizeStart,
  onResizeStop,
}: IReSizeProps) {
  // 控制cursor样式
  const [direction, setDirection] = useState('default');
  const [isDragging, setIsDragging] = useState(false);

  const dragEle = useRef(null);
  const timer = useRef(null);
  const maxRef = useRef(max);
  const minRef = useRef(null);

  let drager = null;

  const dragWidth = (e) => {
    const { x: left = 0 } = dragEle.current.parentElement?.getBoundingClientRect();
    let x = e.clientX;
    let direction = 'default';
    if (minRef.current && x <= minRef.current + left) {
      x = minRef.current;
      direction = 'min';
    } else if (maxRef.current && x >= maxRef.current + left) {
      x = maxRef.current;
      direction = 'max';
    } else {
      x = x - left;
    }
    setDirection(direction);
    onResize?.(x);
  };

  const dragHeight = (e) => {
    let y = document.body.clientHeight - e.clientY;
    let direction = 'default';
    if (minRef.current && y < minRef.current) {
      y = minRef.current;
      direction = 'min';
    }
    if (maxRef.current && y > maxRef.current) {
      y = maxRef.current;
      direction = 'max';
    }
    setDirection(direction);
    onResize?.(y);
  };

  /**
   * 鼠标移动时，调用dragWidth
   * @param e MouseEvent
   */
  const mouseMove = (e) => {
    if (new Date().getTime() - timer.current < 50) return;
    timer.current = new Date().getTime();
    if (type === 'col') {
      dragWidth(e);
    } else {
      dragHeight(e);
    }
  };

  /**
   * 鼠标抬起时，移除mousemove、mouseup监听
   */
  const mouseUp = () => {
    onResizeStop?.();
    setIsDragging(false);
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
  };

  /**
   * 鼠标按下时，添加mousemove、mouseup监听
   * @param e MouseEvent
   */
  const mouseDown = (e) => {
    onResizeStart?.();
    setIsDragging(true);
    document?.addEventListener('mousemove', mouseMove);
    document?.addEventListener('mouseup', mouseUp);
    e.preventDefault();
  };

  /**
   * 添加mousedown事件监听
   */
  const handleDrag = () => {
    drager.addEventListener('mousedown', mouseDown);
  };

  useEffect(() => {
    drager = dragEle.current;
    handleDrag();
    return () => {
      // 销毁时移除mousedown
      drager.removeEventListener('mousedown', mouseDown);
    };
  }, []);

  useEffect(() => {
    if (isMax) {
      setDirection('max');
    } else {
      setDirection('default');
    }
  }, [isMax]);

  useEffect(() => {
    maxRef.current = max;
  }, [max]);

  useEffect(() => {
    minRef.current = min;
  }, [min]);

  return (
    <div
      ref={dragEle}
      className={`resize ${type}-resize ${type}-resize-${direction} ${isDragging ? 'is-dragging' : ''}`}
      style={style || {}}
    />
  );
}
