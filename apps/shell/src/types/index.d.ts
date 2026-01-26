// TypeScript declarations for static assets and Module Federation
import type * as React from 'react';

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Module Federation types (will be expanded as we add remote MFEs)
// Using Record<string, unknown> instead of any for type safety
declare module 'contentReader/*' {
  const component: React.ComponentType<Record<string, unknown>>;
  export default component;
}

declare module 'contentEditor/*' {
  const component: React.ComponentType<Record<string, unknown>>;
  export default component;
}

declare module 'adminDashboard/*' {
  const component: React.ComponentType<Record<string, unknown>>;
  export default component;
}
