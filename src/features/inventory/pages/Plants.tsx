import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/core/layouts/AppLayout";
import PageHeader from "@/shared/components/PageHeader";
import { Leaf, Plus, Search } from "lucide-react";
import { useState } from "react";

const plantData = [
  {
    id: "PB-001",
    species: "Solanum lycopersicum",
    commonName: "Tomato",
    stage: "Growing",
    quantity: 150,
    location: "Greenhouse A",
    status: "Healthy",
  },
  {
    id: "PB-002",
    species: "Arabidopsis thaliana",
    commonName: "Thale Cress",
    stage: "Seedling",
    quantity: 300,
    location: "Growth Chamber 1",
    status: "Healthy",
  },
  {
    id: "PB-003",
    species: "Zea mays",
    commonName: "Maize",
    stage: "Seed",
    quantity: 500,
    location: "Cold Storage",
    status: "Dormant",
  },
  {
    id: "PB-004",
    species: "Oryza sativa",
    commonName: "Rice",
    stage: "Growing",
    quantity: 200,
    location: "Greenhouse B",
    status: "Healthy",
  },
  {
    id: "PB-005",
    species: "Nicotiana tabacum",
    commonName: "Tobacco",
    stage: "Harvested",
    quantity: 45,
    location: "Drying Room",
    status: "Processed",
  },
  {
    id: "PB-006",
    species: "Glycine max",
    commonName: "Soybean",
    stage: "Failed",
    quantity: 0,
    location: "Greenhouse A",
    status: "Failed",
  },
  {
    id: "PB-007",
    species: "Triticum aestivum",
    commonName: "Wheat",
    stage: "Seedling",
    quantity: 400,
    location: "Field Plot 1",
    status: "Healthy",
  },
];

const getStageStyle = (stage: string) => {
  switch (stage) {
    case "Seed":
      return "status-pill status-seed";
    case "Seedling":
      return "status-pill status-seedling";
    case "Growing":
      return "status-pill status-growing";
    case "Harvested":
      return "status-pill status-harvested";
    case "Failed":
      return "status-pill status-failed";
    default:
      return "status-pill status-seed";
  }
};

const Plants = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlants = plantData.filter(
    (plant) =>
      plant.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={Leaf}
          title="Plant Inventory"
          description="Manage plant stock and growth tracking"
          actions={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Plant Stock
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by species, name, or batch ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="seed">Seed</SelectItem>
              <SelectItem value="seedling">Seedling</SelectItem>
              <SelectItem value="growing">Growing</SelectItem>
              <SelectItem value="harvested">Harvested</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="greenhouse-a">Greenhouse A</SelectItem>
              <SelectItem value="greenhouse-b">Greenhouse B</SelectItem>
              <SelectItem value="growth-chamber">Growth Chamber</SelectItem>
              <SelectItem value="field">Field Plots</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium">Batch ID</TableHead>
                <TableHead className="font-medium">Species</TableHead>
                <TableHead className="font-medium">Growth Stage</TableHead>
                <TableHead className="font-medium text-right">
                  Quantity
                </TableHead>
                <TableHead className="font-medium">Location</TableHead>
                <TableHead className="font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlants.map((plant) => (
                <TableRow key={plant.id} className="cursor-pointer">
                  <TableCell className="font-medium text-primary">
                    {plant.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {plant.commonName}
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        {plant.species}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getStageStyle(plant.stage)}>
                      {plant.stage}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {plant.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {plant.location}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {plant.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {filteredPlants.length} of {plantData.length} batches
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Plants;
