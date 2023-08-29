import React, { useEffect, useRef, useState } from 'react';
import './style.less';

interface ExternalProps {
  callback?: (size: number) => void;
  onMouseDown?: () => void;
  isMax?: boolean;
  min?: number;
  max?: number;
  type?: 'col' | 'row';
  style?: any;
}

/**
 * @description 鼠标按下(mouseDown)时，监听mousemove事件，当鼠标x坐标发生变化时，调用dragWidth并将x坐标值作为第一个参数
 * @param callback 是一个Function，用于改变容器宽/高，实现拖动鼠标改变容器宽度的效果，必填项
 * @param isMax 是否最大，当父组件使用全屏按钮时，用于改变direction的值，以改变样式显示
 * @param min 最小值，非必填，默认0
 * @param max 最大值，非必填
 * @param type 类型: col 改变宽度 默认值, row 改变高度
 * @example <div width={col}><ReSize callback={col => setWid(col)} type='col' /></div>
 * @author hhhuilli
 */
const ReSize: React.FC<ExternalProps> = ({
  callback,
  onMouseDown,
  isMax = false,
  min = 0,
  max,
  type = 'col',
  style,
}) => {
  const dragEle = useRef(null);
  const timer = useRef(null);
  const time = useRef(null);
  const limitRef = useRef({ min, max });
  let drager = null;

  // 控制cursor样式
  const [direction, setDirection] = useState('default');

  useEffect(() => {
    typeof min === 'number' && (limitRef.current.min = min);
    max && (limitRef.current.max = max - 5);
  }, [min, max]);

  const dragWidth = (e) => {
    const { min, max } = limitRef.current;
    let x = e.clientX;
    let direction = 'default';
    if (min && x < min) {
      x = min;
      direction = 'min';
    }
    if (max && x > max) {
      x = max;
      direction = 'max';
    }
    setDirection(direction);
    callback?.(x);
  };

  const dragHeight = (e) => {
    const { min, max } = limitRef.current;
    let y = document.body.clientHeight - e.clientY;
    let direction = 'default';
    if (min && y < min) {
      y = min;
      direction = 'min';
    }
    if (max && y > max) {
      y = max;
      direction = 'max';
    }
    setDirection(direction);
    callback?.(y);
  };

  /**
   * 鼠标移动时，调用dragWidth
   * @param e MouseEvent
   */
  const mouseMove = (e) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    function fn() {
      if (type === 'col') {
        dragWidth(e);
      } else {
        dragHeight(e);
      }
    }
    const curr = new Date().getTime();
    if (curr - time.current > 50) {
      fn();
      time.current = curr;
    } else {
      timer.current = setTimeout(() => {
        fn();
        clearTimeout(timer.current);
        timer.current = null;
      }, 20);
    }
  };

  /**
   * 鼠标抬起时，移除mousemove、mouseup监听
   */
  const mouseUp = () => {
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
  };

  /**
   * 鼠标按下时，添加mousemove、mouseup监听
   * @param e MouseEvent
   */
  const mouseDown = (e) => {
    document?.addEventListener('mousemove', mouseMove);
    document?.addEventListener('mouseup', mouseUp);
    onMouseDown?.();
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

  return (
    <div
      ref={dragEle}
      className={`resize ${type}-resize ${type}-resize-${direction}`}
      style={style || {}}
    />
  );
};

export default ReSize;
