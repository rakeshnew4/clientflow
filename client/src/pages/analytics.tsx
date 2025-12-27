import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, TrendingUp, Users, ShoppingCart, Package, Clock } from "lucide-react";

const COLORS = {
  primary: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"],
  secondary: ["#DBEAFE", "#FEE2E2", "#D1FAE5", "#FEF3C7", "#EDE9FE", "#FCE7F3", "#CFFAFE", "#ECFCCB"],
};

interface ChartData {
  [key: string]: any;
}

interface FilterOptions {
  type: string;
  groupBy: string;
  dateRange: string;
}

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [chartType, setChartType] = useState<"bar" | "pie" | "line" | "area">("bar");
  const [filters, setFilters] = useState<FilterOptions>({
    type: "sales",
    groupBy: "category",
    dateRange: "30days"
  });

  // Fetch all analytics data
  const { data: salesByCategory, isLoading: loadingCategory } = useQuery({
    queryKey: ["/api/analytics/sales/category"],
  });

  const { data: salesByPayment, isLoading: loadingPayment } = useQuery({
    queryKey: ["/api/analytics/sales/payment-method"],
  });

  const { data: salesByDemo, isLoading: loadingDemo } = useQuery({
    queryKey: ["/api/analytics/sales/demographics"],
  });

  const { data: trafficByHour, isLoading: loadingTraffic } = useQuery({
    queryKey: ["/api/analytics/traffic/hourly"],
  });

  const { data: trafficBySupermarket, isLoading: loadingStores } = useQuery({
    queryKey: ["/api/analytics/traffic/supermarkets"],
  });

  const { data: inventoryData, isLoading: loadingInventory } = useQuery({
    queryKey: ["/api/analytics/inventory"],
  });

  const { data: lowStockItems, isLoading: loadingLowStock } = useQuery({
    queryKey: ["/api/analytics/inventory/low-stock"],
  });

  const { data: supermarkets } = useQuery({
    queryKey: ["/api/supermarkets"],
  });

  // Custom chart data based on filters
  const { data: customChartData, isLoading: loadingCustom } = useQuery({
    queryKey: ["/api/analytics/custom", filters.type, filters.groupBy],
    queryFn: () => fetch(`/api/analytics/custom?type=${filters.type}&groupBy=${filters.groupBy}`).then(res => res.json()),
  });

  // Format data for different chart types
  const formatDataForChart = (data: ChartData[], valueKey: string, nameKey: string) => {
    if (!data) return [];
    return data.map(item => ({
      name: item[nameKey],
      value: item[valueKey],
      ...item
    }));
  };

  // Calculate overview metrics
  const overviewMetrics = useMemo(() => {
    if (!salesByCategory || !Array.isArray(salesByCategory) || 
        !trafficBySupermarket || !Array.isArray(trafficBySupermarket) || 
        !inventoryData || !Array.isArray(inventoryData)) return null;

    const totalRevenue = salesByCategory.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    const totalTransactions = salesByCategory.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
    const totalVisitors = trafficBySupermarket.reduce((sum: number, item: any) => sum + (item.totalVisitors || 0), 0);
    const totalProducts = inventoryData.length || 0;
    const lowStockCount = Array.isArray(lowStockItems) ? lowStockItems.length : 0;

    return {
      totalRevenue: totalRevenue / 100, // Convert from cents
      totalTransactions,
      totalVisitors,
      totalProducts,
      lowStockCount,
      averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions / 100 : 0,
    };
  }, [salesByCategory, trafficBySupermarket, inventoryData, lowStockItems]);

  const renderChart = (data: ChartData[], config: any) => {
    const chartData = formatDataForChart(data, config.valueKey, config.nameKey);

    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`$${(value / 100).toLocaleString()}`, "Revenue"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`$${(value / 100).toLocaleString()}`, "Revenue"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`$${(value / 100).toLocaleString()}`, "Revenue"]} />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default: // bar
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`$${(value / 100).toLocaleString()}`, "Revenue"]} />
              <Legend />
              <Bar
                dataKey="value"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  if (loadingCategory || loadingPayment || loadingDemo || loadingTraffic || loadingStores) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight" data-testid="page-title">Supermarket Analytics Dashboard</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6" data-testid="analytics-dashboard">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight" data-testid="page-title">Supermarket Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" data-testid="store-count">
            {Array.isArray(supermarkets) ? supermarkets.length : 0} Stores
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="sales" data-testid="tab-sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="traffic" data-testid="tab-traffic">Customer Traffic</TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
          <TabsTrigger value="custom" data-testid="tab-custom">Custom Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {overviewMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card data-testid="metric-revenue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${overviewMetrics.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg: ${overviewMetrics.averageTransaction.toFixed(2)} per transaction
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="metric-transactions">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewMetrics.totalTransactions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all stores
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="metric-visitors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewMetrics.totalVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 7 days
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="metric-inventory">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewMetrics.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    {overviewMetrics.lowStockCount} low stock items
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="chart-sales-category">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                {Array.isArray(salesByCategory) && renderChart(salesByCategory, { valueKey: "total", nameKey: "category" })}
              </CardContent>
            </Card>

            <Card data-testid="chart-traffic-hourly">
              <CardHeader>
                <CardTitle>Customer Traffic by Hour</CardTitle>
                <CardDescription>Visitor patterns throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                {Array.isArray(trafficByHour) && (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={trafficByHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(hour) => `${hour}:00`}
                        formatter={(value, name) => [value.toLocaleString(), name === "totalVisitors" ? "Visitors" : "Avg Transaction"]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="totalVisitors"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="chart-payment-methods">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={Array.isArray(salesByPayment) ? salesByPayment.map((item: any) => ({
                        name: item.method.charAt(0).toUpperCase() + item.method.slice(1),
                        value: item.total
                      })) : []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Array.isArray(salesByPayment) && salesByPayment.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${(value / 100).toLocaleString()}`, "Revenue"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="chart-demographics">
              <CardHeader>
                <CardTitle>Sales by Demographics</CardTitle>
                <CardDescription>Customer demographics and spending patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={Array.isArray(salesByDemo) ? salesByDemo.map((item: any) => ({
                    name: `${item.gender} ${item.ageGroup}`,
                    value: item.total,
                    count: item.count
                  })) : []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${(value / 100).toLocaleString()}`, "Revenue"]} />
                    <Legend />
                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="chart-traffic-stores">
              <CardHeader>
                <CardTitle>Traffic by Supermarket</CardTitle>
                <CardDescription>Visitor numbers across different locations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={Array.isArray(trafficBySupermarket) ? trafficBySupermarket : []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalVisitors" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="chart-traffic-hourly-detail">
              <CardHeader>
                <CardTitle>Hourly Traffic & Transaction Value</CardTitle>
                <CardDescription>Visitor count and average transaction by hour</CardDescription>
              </CardHeader>
              <CardContent>
{Array.isArray(trafficByHour) && (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trafficByHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis yAxisId="visitors" />
                      <YAxis yAxisId="transaction" orientation="right" />
                      <Tooltip 
                        labelFormatter={(hour) => `${hour}:00`}
                        formatter={(value, name) => [
                          name === "totalVisitors" 
                            ? value.toLocaleString() 
                            : `$${((value as number) / 100).toFixed(2)}`,
                          name === "totalVisitors" ? "Visitors" : "Avg Transaction"
                        ]}
                      />
                      <Legend />
                      <Line 
                        yAxisId="visitors"
                        type="monotone" 
                        dataKey="totalVisitors" 
                        stroke="#3B82F6" 
                        strokeWidth={3} 
                        dot={{ fill: "#3B82F6" }}
                      />
                      <Line 
                        yAxisId="transaction"
                        type="monotone" 
                        dataKey="avgTransaction" 
                        stroke="#EF4444" 
                        strokeWidth={3} 
                        dot={{ fill: "#EF4444" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card data-testid="inventory-alerts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Items that need restocking</CardDescription>
              </CardHeader>
              <CardContent>
{Array.isArray(lowStockItems) && lowStockItems.length > 0 ? (
                  <div className="space-y-2">
                    {lowStockItems.slice(0, 10).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`low-stock-item-${index}`}>
                        <div>
                          <span className="font-medium">{item.product}</span>
                          <span className="text-sm text-muted-foreground ml-2">({item.category})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            {item.currentStock} / {item.minimumStock}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">All items are adequately stocked!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card data-testid="custom-chart-generator">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Custom Chart Generator
              </CardTitle>
              <CardDescription>Create custom visualizations from your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Data Type</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger data-testid="filter-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Data</SelectItem>
                      <SelectItem value="traffic">Traffic Data</SelectItem>
                      <SelectItem value="inventory">Inventory Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Group By</label>
                  <Select value={filters.groupBy} onValueChange={(value) => setFilters({...filters, groupBy: value})}>
                    <SelectTrigger data-testid="filter-group-by">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filters.type === "sales" && (
                        <>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="payment">Payment Method</SelectItem>
                          <SelectItem value="demographics">Demographics</SelectItem>
                        </>
                      )}
                      {filters.type === "traffic" && (
                        <>
                          <SelectItem value="hour">Hour</SelectItem>
                          <SelectItem value="supermarket">Supermarket</SelectItem>
                        </>
                      )}
                      {filters.type === "inventory" && (
                        <>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="low-stock">Low Stock Items</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Chart Type</label>
                  <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                    <SelectTrigger data-testid="filter-chart-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      // Trigger a refetch by updating the query key
                      setFilters({...filters});
                    }}
                    data-testid="button-generate-chart"
                  >
                    Generate Chart
                  </Button>
                </div>
              </div>

{!loadingCustom && Array.isArray(customChartData) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4" data-testid="custom-chart-title">
                    {filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} by {filters.groupBy.charAt(0).toUpperCase() + filters.groupBy.slice(1)}
                  </h3>
                  <div data-testid="custom-chart-container">
                    {renderChart(customChartData, { 
                      valueKey: filters.type === "traffic" && filters.groupBy === "supermarket" ? "totalVisitors" : 
                                filters.type === "traffic" && filters.groupBy === "hour" ? "totalVisitors" : "total", 
                      nameKey: filters.groupBy === "supermarket" ? "name" : 
                              filters.groupBy === "hour" ? "hour" :
                              filters.groupBy === "category" ? "category" :
                              filters.groupBy === "payment" ? "method" : "name"
                    })}
                  </div>
                </div>
              )}

              {loadingCustom && (
                <div className="mt-6 h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;