'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

export const ChartTooltip = RechartsPrimitive.Tooltip;

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export const ChartLegend = RechartsPrimitive.Legend;

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

// The original custom Chart component for backward compatibility
interface ChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  barColors?: string[];
  maxValue?: number;
  title?: string;
  subtitle?: string;
  trendValue?: number;
  className?: string;
  type?: 'bar' | 'line';
  showTrendIndicator?: boolean;
}

export function Chart({
  data,
  labels = [],
  height = 200,
  barColors = ['var(--primary)', 'hsl(var(--primary))', 'hsl(var(--muted))'],
  maxValue,
  title,
  subtitle,
  trendValue = 0,
  className,
  type = 'bar',
  showTrendIndicator = true,
}: ChartProps) {
  const calculatedMaxValue = maxValue || Math.max(...data) * 1.2;
  
  const renderBar = (value: number, index: number) => {
    const heightPercentage = (value / calculatedMaxValue) * 100;
    const barColor = barColors[index % barColors.length];
    
    return (
      <div key={index} className="flex flex-col items-center w-full">
        <div 
          className="relative w-full rounded-sm transition-all duration-300 ease-in-out"
          style={{
            height: `${height}px`,
            maxWidth: '24px',
            margin: '0 auto'
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-primary rounded-sm transition-all duration-500 ease-in-out"
            style={{
              height: `${heightPercentage}%`,
              backgroundColor: barColor,
              width: '100%'
            }}
          />
        </div>
        {labels[index] && (
          <span className="mt-2 text-xs text-muted-foreground">
            {labels[index]}
          </span>
        )}
      </div>
    );
  };

  const renderLine = (values: number[]) => {
    const points = values.map((value, index) => {
      const x = `${(index / (values.length - 1)) * 100}%`;
      const y = `${100 - (value / calculatedMaxValue) * 100}%`;
      return { x, y, value };
    });

    return (
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {/* Draw axes */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-border" />
        <div className="absolute top-0 bottom-0 left-0 w-px bg-border" />
        
        {/* Draw points and connect them */}
        {points.map((point, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <div 
                className="absolute bg-primary"
                style={{
                  height: '2px',
                  bottom: points[index - 1].y,
                  left: points[index - 1].x,
                  transformOrigin: 'left bottom',
                  transform: `rotate(${Math.atan2(
                    parseFloat(point.y) - parseFloat(points[index - 1].y),
                    parseFloat(point.x) - parseFloat(points[index - 1].x)
                  )}rad)`,
                  width: `${Math.sqrt(
                    Math.pow(parseFloat(point.x) - parseFloat(points[index - 1].x), 2) +
                    Math.pow(parseFloat(point.y) - parseFloat(points[index - 1].y), 2)
                  )}%`,
                  backgroundColor: barColors[0]
                }}
              />
            )}
            <div 
              className="absolute w-2 h-2 rounded-full bg-primary border-2 border-background"
              style={{
                bottom: point.y,
                left: point.x,
                transform: 'translate(-50%, 50%)',
                backgroundColor: barColors[0]
              }}
            />
          </React.Fragment>
        ))}
        
        {/* Labels */}
        <div className="absolute bottom-0 w-full flex justify-between">
          {labels.map((label, index) => (
            <div 
              key={index} 
              className="text-xs text-muted-foreground"
              style={{
                position: 'absolute',
                left: `${(index / (labels.length - 1)) * 100}%`,
                bottom: '-24px',
                transform: 'translateX(-50%)'
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {(title || subtitle || (showTrendIndicator && trendValue !== 0)) && (
        <div className="space-y-1">
          {title && <h4 className="text-sm font-medium">{title}</h4>}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {showTrendIndicator && trendValue !== 0 && (
            <p className={cn(
              "text-xs flex items-center",
              trendValue > 0 ? "text-green-500" : "text-red-500"
            )}>
              <span className="mr-1">
                {trendValue > 0 ? '↑' : '↓'}
              </span>
              {Math.abs(trendValue)}% from last month
            </p>
          )}
        </div>
      )}
      
      <div className="relative w-full">
        <div className={cn(
          "grid gap-2 w-full",
          type === 'bar' ? "grid-flow-col auto-cols-fr" : ""
        )}>
          {type === 'bar' 
            ? data.map((value, index) => renderBar(value, index))
            : renderLine(data)
          }
        </div>
      </div>
    </div>
  );
}

export function ChartCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Helper function for the new shadcn chart components
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export { ChartStyle }; 