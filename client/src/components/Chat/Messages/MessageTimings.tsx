import { memo, useMemo } from 'react';
import { Clock, Zap, Hash } from 'lucide-react';
import type { TMessage } from 'librechat-data-provider';
import type { TTimingInfo } from 'librechat-data-provider';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

type TMessageTimingsProps = {
  message: TMessage;
  className?: string;
};

/**
 * Formats a duration in milliseconds to a human-readable string
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

/**
 * Formats tokens per second to a readable string
 */
function formatTokensPerSecond(tps: number): string {
  if (tps >= 100) {
    return `${Math.round(tps)}`;
  }
  return tps.toFixed(1);
}

/**
 * Component to display timing information for LLM responses
 * Shows total tokens, tokens/second, and generation time
 */
const MessageTimings = memo(({ message, className }: TMessageTimingsProps) => {
  const localize = useLocalize();

  const timingInfo = useMemo(() => {
    if (!message.metadata?.timingInfo) {
      return null;
    }
    return message.metadata.timingInfo as TTimingInfo;
  }, [message.metadata?.timingInfo]);

  if (!timingInfo) {
    return null;
  }

  const { totalTokens, tokenPerSecond, generationTimeMs, promptTokens, completionTokens } =
    timingInfo;

  // Only render if we have at least some timing data
  const hasData = totalTokens != null || tokenPerSecond != null || generationTimeMs != null;
  if (!hasData) {
    return null;
  }

  const itemStyle = cn(
    'flex items-center gap-1 text-text-secondary-alt',
    'text-[11px] leading-none',
  );

  const iconProps = {
    size: 12,
    strokeWidth: 1.5,
    className: 'opacity-70',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-text-tertiary',
        'select-none',
        className,
      )}
      aria-label={localize('com_ui_timing_info')}
    >
      {/* Total Tokens */}
      {totalTokens != null && (
        <span className={itemStyle} title={localize('com_ui_total_tokens')}>
          <Hash {...iconProps} aria-hidden="true" />
          <span>
            {totalTokens.toLocaleString()}
            {promptTokens != null && completionTokens != null && (
              <span className="opacity-60 ml-0.5">
                ({promptTokens}+{completionTokens})
              </span>
            )}
          </span>
        </span>
      )}

      {/* Tokens per Second */}
      {tokenPerSecond != null && tokenPerSecond > 0 && (
        <span className={itemStyle} title={localize('com_ui_tokens_per_second')}>
          <Zap {...iconProps} aria-hidden="true" />
          <span>{formatTokensPerSecond(tokenPerSecond)} t/s</span>
        </span>
      )}

      {/* Generation Time */}
      {generationTimeMs != null && generationTimeMs > 0 && (
        <span className={itemStyle} title={localize('com_ui_generation_time')}>
          <Clock {...iconProps} aria-hidden="true" />
          <span>{formatDuration(generationTimeMs)}</span>
        </span>
      )}
    </div>
  );
});

MessageTimings.displayName = 'MessageTimings';

export default MessageTimings;
