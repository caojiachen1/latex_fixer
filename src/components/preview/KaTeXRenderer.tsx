import React, { useState, useEffect, useRef } from 'react';
import { tokens } from '@fluentui/react-components';
import { renderKatexAsync } from '../../services/latex/katexWorker';

interface Props {
  latex: string;
  displayMode?: boolean;
  className?: string;
  lazyLoad?: boolean;
}

export const KaTeXRenderer: React.FC<Props> = ({
  latex,
  displayMode = false,
  className,
  lazyLoad = false,
}) => {
  const [renderState, setRenderState] = useState({
    html: latex,
    error: false,
    loading: lazyLoad,
  });
  const [readyToRender, setReadyToRender] = useState(!lazyLoad);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setRenderState({ html: latex, error: false, loading: lazyLoad });
  }, [latex, lazyLoad]);

  useEffect(() => {
    if (!lazyLoad) {
      setReadyToRender(true);
      return;
    }

    const element = spanRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setReadyToRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [lazyLoad]);

  useEffect(() => {
    if (!readyToRender) {
      return;
    }

    let cancelled = false;
    const requestId = ++requestIdRef.current;
    setRenderState((prev) => ({ ...prev, loading: true }));

    renderKatexAsync(latex, displayMode)
      .then((result) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setRenderState({ html: result.html, error: result.error, loading: false });
      })
      .catch(() => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setRenderState({ html: latex, error: true, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [latex, displayMode, readyToRender]);

  if (renderState.error) {
    return (
      <span
        ref={spanRef}
        className={className}
        style={{ color: tokens.colorPaletteRedForeground1, fontFamily: 'monospace' }}
      >
        {latex}
      </span>
    );
  }

  return (
    <span
      ref={spanRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: renderState.html }}
    />
  );
};
