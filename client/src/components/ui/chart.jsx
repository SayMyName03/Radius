import * as React from "react"
import * as RechartsPrimitive from "recharts"

// Chart Container
const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={`flex aspect-video justify-center text-xs ${className || ""}`}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      <RechartsPrimitive.ResponsiveContainer>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).reduce((acc, [key, value]) => {
    if (value.color) {
      acc[`--color-${key}`] = value.color
    }
    return acc
  }, {})

  return (
    <style dangerouslySetInnerHTML={{
      __html: Object.entries(colorConfig).map(
        ([key, value]) => `[data-chart="${id}"] { ${key}: ${value}; }`
      ).join("\n")
    }} />
  )
}

// Tooltip
const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef(
  ({ active, payload, className, hideLabel = false, hideIndicator = false, indicator = "dot", label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey }, ref) => {
    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={`grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-xl ${className || ""}`}
      >
        {!nestLabel ? (
          <>
            {!hideLabel && (
              <div className={`font-medium text-gray-900 ${labelClassName || ""}`}>
                {labelFormatter ? labelFormatter(label, payload) : label}
              </div>
            )}
            <div className="grid gap-1.5">
              {payload.map((item, index) => {
                const key = `${nameKey || item.name || item.dataKey || "value"}`
                const itemConfig = item.payload.config?.[key] || {}
                const indicatorColor = color || item.payload.fill || item.color

                return (
                  <div
                    key={item.dataKey}
                    className="flex w-full items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-gray-500"
                  >
                    {!hideIndicator && (
                      <div
                        className="shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: indicatorColor,
                          width: indicator === "dot" ? "0.5rem" : "0.25rem",
                          height: indicator === "dot" ? "0.5rem" : "1rem",
                        }}
                      />
                    )}
                    <div className="flex flex-1 justify-between gap-2 leading-none">
                      <span className="text-gray-600">
                        {itemConfig?.label || key}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-gray-900">
                        {formatter ? formatter(item.value, item.name, item, index, payload) : item.value}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="grid gap-1.5">
            {payload.map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`
              const itemConfig = item.payload.config?.[key] || {}

              return (
                <div key={item.dataKey} className="flex flex-col gap-0.5">
                  <span className="text-gray-600">
                    {itemConfig?.label || key}
                  </span>
                  <span className="font-mono text-sm font-medium tabular-nums text-gray-900">
                    {formatter ? formatter(item.value, item.name, item, index, payload) : item.value}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Legend
const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={`flex items-center justify-center gap-4 ${className || ""}`}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = item.payload?.config?.[key] || {}

          return (
            <div
              key={item.value}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-gray-500"
            >
              {!hideIcon && (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              <span className="text-gray-600">
                {itemConfig?.label || item.value}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
