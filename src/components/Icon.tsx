import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'calendar'
  | 'plus'
  | 'leaf'
  | 'pin'
  | 'confetti'
  | 'flask'
  | 'smile'
  | 'note'
  | 'mic'
  | 'sparkle'
  | 'book'
  | 'book-open'
  | 'folder'
  | 'check-circle'
  | 'file'
  | 'headphones'
  | 'trash'
  | 'bulb'
  | 'refresh'
  | 'alert-circle'
  | 'upload'
  | 'receipt'
  | 'help-circle'
  | 'target'
  | 'eye'
  | 'brain'
  | 'edit'
  | 'bolt'
  | 'graduation-cap'
  | 'lock'
  | 'diamond'
  | 'key'
  | 'dollar'
  | 'building'
  | 'compass'
  | 'settings'
  | 'cloud'
  | 'bell'
  | 'tool'
  | 'check'
  | 'megaphone'
  | 'briefcase'
  | 'clipboard'
  | 'rocket'
  | 'scale'
  | 'credit-card'
  | 'robot'
  | 'sun'
  | 'moon'
  | 'sunrise'
  | 'sunset'
  | 'more'
  | 'star'
  | 'layers'
  | 'info';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Small hand-drawn line-icon set on a 24x24 grid, replacing emoji throughout the app — emoji
 * render inconsistently across platforms and read as a generic/templated choice, this gives
 * Studiq its own consistent icon language instead.
 */
interface CommonStrokeProps {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: 'round';
  strokeLinejoin: 'round';
  fill: 'none';
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  const common: CommonStrokeProps = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderIcon(name, common, color)}
    </Svg>
  );
}

function renderIcon(name: IconName, common: CommonStrokeProps, color: string) {
  switch (name) {
    case 'home':
      return (
        <>
          <Path d="M4 11.5 12 4l8 7.5" {...common} />
          <Path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" {...common} />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect x={4} y={5.5} width={16} height={14.5} rx={2} {...common} />
          <Line x1={4} y1={10} x2={20} y2={10} {...common} />
          <Line x1={8} y1={3.5} x2={8} y2={7} {...common} />
          <Line x1={16} y1={3.5} x2={16} y2={7} {...common} />
        </>
      );
    case 'plus':
      return (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...common} />
          <Line x1={5} y1={12} x2={19} y2={12} {...common} />
        </>
      );
    case 'leaf':
      return (
        <>
          <Path d="M20 4c0 9-6 15-15 15C5 10 11 4 20 4Z" {...common} />
          <Path d="M6 18c3-4 7-7 12-11" {...common} />
        </>
      );
    case 'pin':
      return (
        <>
          <Path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" {...common} />
          <Circle cx={12} cy={9.5} r={2.3} {...common} />
        </>
      );
    case 'confetti':
      return (
        <>
          <Rect x={4} y={4} width={3} height={3} rx={0.6} transform="rotate(20 5.5 5.5)" fill={color} stroke="none" />
          <Rect x={17} y={5} width={3} height={3} rx={0.6} transform="rotate(-15 18.5 6.5)" fill={color} stroke="none" />
          <Circle cx={19} cy={15} r={1.6} fill={color} stroke="none" />
          <Rect x={5} y={16} width={3} height={3} rx={0.6} transform="rotate(35 6.5 17.5)" fill={color} stroke="none" />
          <Path d="M11 14 13 9" {...common} />
        </>
      );
    case 'flask':
      return (
        <>
          <Path d="M10 3h4" {...common} />
          <Path d="M10 3v6.5L5.5 18a2 2 0 0 0 1.8 2.9h9.4a2 2 0 0 0 1.8-2.9L14 9.5V3" {...common} />
          <Line x1={8.5} y1={14} x2={15.5} y2={14} {...common} />
        </>
      );
    case 'smile':
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...common} />
          <Path d="M8.5 14c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" {...common} />
          <Circle cx={9} cy={10} r={0.9} fill={color} stroke="none" />
          <Circle cx={15} cy={10} r={0.9} fill={color} stroke="none" />
        </>
      );
    case 'note':
      return (
        <>
          <Rect x={5} y={3.5} width={14} height={17} rx={2} {...common} />
          <Line x1={8} y1={8.5} x2={16} y2={8.5} {...common} />
          <Line x1={8} y1={12.5} x2={16} y2={12.5} {...common} />
          <Line x1={8} y1={16.5} x2={13} y2={16.5} {...common} />
        </>
      );
    case 'mic':
      return (
        <>
          <Rect x={9} y={3} width={6} height={11} rx={3} {...common} />
          <Path d="M5.5 11a6.5 6.5 0 0 0 13 0" {...common} />
          <Line x1={12} y1={17.5} x2={12} y2={21} {...common} />
          <Line x1={8.5} y1={21} x2={15.5} y2={21} {...common} />
        </>
      );
    case 'sparkle':
      return (
        <>
          <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" {...common} />
          <Path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" fill={color} stroke="none" />
        </>
      );
    case 'book':
      return (
        <>
          <Rect x={5} y={4} width={14} height={16} rx={1.5} {...common} />
          <Line x1={8.5} y1={4} x2={8.5} y2={20} {...common} />
        </>
      );
    case 'book-open':
      return (
        <>
          <Path d="M12 6.5C10.3 5 7.8 4.3 4.5 4.5v13.8c3.3-.2 5.8.5 7.5 2 1.7-1.5 4.2-2.2 7.5-2V4.5c-3.3-.2-5.8.5-7.5 2Z" {...common} />
          <Line x1={12} y1={6.5} x2={12} y2={20.3} {...common} />
        </>
      );
    case 'folder':
      return <Path d="M4 6.5a1.5 1.5 0 0 1 1.5-1.5H10l2 2.5h6.5A1.5 1.5 0 0 1 20 9v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z" {...common} />;
    case 'check-circle':
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...common} />
          <Polyline points="8.5,12.2 11,14.8 15.5,9.5" {...common} />
        </>
      );
    case 'file':
      return (
        <>
          <Path d="M6 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19Z" {...common} />
          <Path d="M14 3.5v4h4" {...common} />
        </>
      );
    case 'headphones':
      return (
        <>
          <Path d="M4 15v-3a8 8 0 0 1 16 0v3" {...common} />
          <Rect x={3} y={14} width={4} height={6} rx={1.3} {...common} />
          <Rect x={17} y={14} width={4} height={6} rx={1.3} {...common} />
        </>
      );
    case 'trash':
      return (
        <>
          <Line x1={4.5} y1={7} x2={19.5} y2={7} {...common} />
          <Path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" {...common} />
          <Path d="M6.5 7 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" {...common} />
        </>
      );
    case 'bulb':
      return (
        <>
          <Path d="M9 17.5h6" {...common} />
          <Path d="M8.5 21h7" {...common} />
          <Path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" {...common} />
        </>
      );
    case 'refresh':
      return (
        <>
          <Path d="M4.5 12a7.5 7.5 0 0 1 12.6-5.5L19.5 8" {...common} />
          <Polyline points="19.5,4 19.5,8 15.5,8" {...common} />
          <Path d="M19.5 12a7.5 7.5 0 0 1-12.6 5.5L4.5 16" {...common} />
          <Polyline points="4.5,20 4.5,16 8.5,16" {...common} />
        </>
      );
    case 'alert-circle':
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...common} />
          <Line x1={12} y1={8} x2={12} y2={13} {...common} />
          <Circle cx={12} cy={16.2} r={0.9} fill={color} stroke="none" />
        </>
      );
    case 'upload':
      return (
        <>
          <Path d="M12 15V4" {...common} />
          <Polyline points="8,8 12,4 16,8" {...common} />
          <Path d="M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15" {...common} />
        </>
      );
    case 'receipt':
      return (
        <>
          <Path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4Z" {...common} />
          <Line x1={8.5} y1={8} x2={15.5} y2={8} {...common} />
          <Line x1={8.5} y1={12} x2={15.5} y2={12} {...common} />
        </>
      );
    case 'help-circle':
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...common} />
          <Path d="M9.8 9.5a2.2 2.2 0 1 1 3.3 2.5c-.7.5-1.1.9-1.1 1.9" {...common} />
          <Circle cx={12} cy={16.7} r={0.9} fill={color} stroke="none" />
        </>
      );
    case 'target':
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...common} />
          <Circle cx={12} cy={12} r={4.5} {...common} />
          <Circle cx={12} cy={12} r={1} fill={color} stroke="none" />
        </>
      );
    case 'eye':
      return (
        <>
          <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...common} />
          <Circle cx={12} cy={12} r={2.8} {...common} />
        </>
      );
    case 'brain':
      return (
        <>
          <Path d="M9.5 4.5a3 3 0 0 0-3 3 3 3 0 0 0-1.5 5.6A3 3 0 0 0 8 17.5a3 3 0 0 0 5.5 1.7" {...common} />
          <Path d="M14.5 4.5a3 3 0 0 1 3 3 3 3 0 0 1 1.5 5.6A3 3 0 0 1 16 17.5a3 3 0 0 1-2.5 1.4V6.5a2 2 0 0 0-4 0" {...common} />
        </>
      );
    case 'edit':
      return (
        <>
          <Path d="M4 20l.9-3.6L16 5.3a1.7 1.7 0 0 1 2.4 0l.3.3a1.7 1.7 0 0 1 0 2.4L7.6 19.1Z" {...common} />
          <Line x1={14.3} y1={7} x2={17} y2={9.7} {...common} />
        </>
      );
    case 'bolt':
      return <Path d="M13 2 5 13.5h5.5L11 22l8-12h-5.5Z" {...common} />;
    case 'graduation-cap':
      return (
        <>
          <Path d="M2.5 9 12 5l9.5 4-9.5 4-9.5-4Z" {...common} />
          <Path d="M6.5 11.3v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4" {...common} />
          <Path d="M21.5 9v5.5" {...common} />
        </>
      );
    case 'lock':
      return (
        <>
          <Rect x={5} y={10.5} width={14} height={10} rx={2} {...common} />
          <Path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" {...common} />
        </>
      );
    case 'diamond':
      return (
        <>
          <Path d="M4.5 9 8 4h8l3.5 5-7.5 11Z" {...common} />
          <Line x1={4.5} y1={9} x2={19.5} y2={9} {...common} />
          <Line x1={9.5} y1={9} x2={12} y2={20} {...common} />
          <Line x1={14.5} y1={9} x2={12} y2={20} {...common} />
        </>
      );
    case 'key':
      return (
        <>
          <Circle cx={8} cy={15} r={3.5} {...common} />
          <Line x1={10.3} y1={12.6} x2={20} y2={3} {...common} />
          <Line x1={16} y1={7.3} x2={18.5} y2={9.8} {...common} />
          <Line x1={13} y1={10.3} x2={15} y2={12.3} {...common} />
        </>
      );
    case 'dollar':
      return (
        <>
          <Line x1={12} y1={3} x2={12} y2={21} {...common} />
          <Path d="M16 7.5c0-1.7-1.8-2.7-4-2.7s-4 1-4 2.7c0 3.6 8 1.8 8 5.4 0 1.7-1.8 2.8-4 2.8s-4-1.1-4-2.8" {...common} />
        </>
      );
    case 'building':
      return (
        <>
          <Rect x={5} y={3.5} width={14} height={17} rx={1} {...common} />
          <Line x1={9} y1={7.5} x2={9} y2={7.6} strokeWidth={3} stroke={color} strokeLinecap="round" />
          <Line x1={12} y1={7.5} x2={12} y2={7.6} strokeWidth={3} stroke={color} strokeLinecap="round" />
          <Line x1={15} y1={7.5} x2={15} y2={7.6} strokeWidth={3} stroke={color} strokeLinecap="round" />
          <Line x1={9} y1={11.5} x2={9} y2={11.6} strokeWidth={3} stroke={color} strokeLinecap="round" />
          <Line x1={12} y1={11.5} x2={12} y2={11.6} strokeWidth={3} stroke={color} strokeLinecap="round" />
          <Line x1={15} y1={11.5} x2={15} y2={11.6} strokeWidth={3} stroke={color} strokeLinecap="round" />
          <Path d="M10 20.5v-4h4v4" {...common} />
        </>
      );
    case 'compass':
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...common} />
          <Path d="M15 9l-2 5-4.5 1.5L10.5 10Z" {...common} strokeLinejoin="round" />
        </>
      );
    case 'settings':
      return (
        <>
          <Circle cx={12} cy={12} r={3.2} {...common} />
          <Path
            d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8M18.6 18.6l-1.8-1.8M7.2 7.2 5.4 5.4"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    case 'cloud':
      return <Path d="M7 18.5a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.8-1.4A4.2 4.2 0 0 1 17 18.5Z" {...common} />;
    case 'bell':
      return (
        <>
          <Path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14.5 6 10.5Z" {...common} />
          <Path d="M10 18.5a2 2 0 0 0 4 0" {...common} />
        </>
      );
    case 'tool':
      return (
        <Path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94Z"
          {...common}
          strokeLinejoin="round"
        />
      );
    case 'check':
      return <Polyline points="5,12.5 9.5,17 19,6" {...common} />;
    case 'megaphone':
      return (
        <>
          <Path d="M3.5 9v6h3l8 4V5l-8 4Z" {...common} />
          <Path d="M14.5 9a4 4 0 0 1 0 6" {...common} />
          <Path d="M6.5 15v3.5a1.3 1.3 0 0 0 2.5.4" {...common} />
        </>
      );
    case 'briefcase':
      return (
        <>
          <Rect x={3.5} y={7.5} width={17} height={11.5} rx={2} {...common} />
          <Path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" {...common} />
          <Line x1={3.5} y1={12.5} x2={20.5} y2={12.5} {...common} />
        </>
      );
    case 'clipboard':
      return (
        <>
          <Rect x={5.5} y={4.5} width={13} height={16} rx={2} {...common} />
          <Rect x={9} y={3} width={6} height={3} rx={1} {...common} />
          <Line x1={8.5} y1={11} x2={15.5} y2={11} {...common} />
          <Line x1={8.5} y1={14.5} x2={15.5} y2={14.5} {...common} />
        </>
      );
    case 'rocket':
      return (
        <>
          <Path d="M12 2.5c3 1.5 5 5 5 9.5 0 2-1 4-2 5l-3 2.5-3-2.5c-1-1-2-3-2-5 0-4.5 2-8 5-9.5Z" {...common} />
          <Circle cx={12} cy={11} r={1.8} {...common} />
          <Path d="M8.5 17 6 21l3-1" {...common} />
          <Path d="M15.5 17 18 21l-3-1" {...common} />
        </>
      );
    case 'scale':
      return (
        <>
          <Line x1={12} y1={4} x2={12} y2={20} {...common} />
          <Line x1={6} y1={7} x2={18} y2={7} {...common} />
          <Path d="M3.5 12 6 7l2.5 5a2.5 2.5 0 0 1-5 0Z" {...common} />
          <Path d="M15.5 12 18 7l2.5 5a2.5 2.5 0 0 1-5 0Z" {...common} />
          <Line x1={9} y1={20} x2={15} y2={20} {...common} />
        </>
      );
    case 'credit-card':
      return (
        <>
          <Rect x={3} y={6} width={18} height={13} rx={2} {...common} />
          <Line x1={3} y1={10} x2={21} y2={10} {...common} />
          <Line x1={6} y1={14.5} x2={10} y2={14.5} {...common} />
        </>
      );
    case 'robot':
      return (
        <>
          <Rect x={5} y={8} width={14} height={11} rx={2.5} {...common} />
          <Line x1={12} y1={4.5} x2={12} y2={8} {...common} />
          <Circle cx={12} cy={3.5} r={1} fill={color} stroke="none" />
          <Circle cx={9} cy={13} r={1.2} fill={color} stroke="none" />
          <Circle cx={15} cy={13} r={1.2} fill={color} stroke="none" />
          <Line x1={9} y1={16.5} x2={15} y2={16.5} {...common} />
          <Line x1={2.5} y1={11} x2={5} y2={11} {...common} />
          <Line x1={19} y1={11} x2={21.5} y2={11} {...common} />
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx={12} cy={12} r={4.2} {...common} />
          <Path
            d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6"
            {...common}
          />
        </>
      );
    case 'moon':
      return <Path d="M18.5 14.5a8 8 0 0 1-10-10 8 8 0 1 0 10 10Z" {...common} />;
    case 'sunrise':
      return (
        <>
          <Path d="M4.5 18h15" {...common} />
          <Path d="M7 18a5 5 0 0 1 10 0" {...common} />
          <Path d="M12 6.5V4M6 9l1.5 1.5M18 9l-1.5 1.5" {...common} />
        </>
      );
    case 'sunset':
      return (
        <>
          <Path d="M4.5 18h15" {...common} />
          <Path d="M7 18a5 5 0 0 1 10 0" {...common} />
          <Path d="M12 4v2.5M6 9l1.5-1.5M18 9l-1.5-1.5" {...common} />
        </>
      );
    case 'more':
      return (
        <>
          <Circle cx={5.5} cy={12} r={1.6} fill={color} stroke="none" />
          <Circle cx={12} cy={12} r={1.6} fill={color} stroke="none" />
          <Circle cx={18.5} cy={12} r={1.6} fill={color} stroke="none" />
        </>
      );
    case 'star':
      return <Path d="M12 3.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7Z" {...common} strokeLinejoin="round" />;
    case 'layers':
      return (
        <>
          <Path d="M12 3.5 21 8l-9 4.5L3 8Z" {...common} strokeLinejoin="round" />
          <Path d="M3 12l9 4.5 9-4.5" {...common} />
          <Path d="M3 16l9 4.5 9-4.5" {...common} />
        </>
      );
    case 'info':
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...common} />
          <Line x1={12} y1={11} x2={12} y2={16} {...common} />
          <Circle cx={12} cy={7.8} r={0.9} fill={color} stroke="none" />
        </>
      );
    default:
      return null;
  }
}
