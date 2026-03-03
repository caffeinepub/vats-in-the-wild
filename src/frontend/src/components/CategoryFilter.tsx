import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="overflow-x-auto pb-1" data-ocid="category_filter.tab">
      <Tabs value={selected} onValueChange={onChange}>
        <TabsList className="bg-muted/50 border border-border h-auto p-1 gap-1 flex-wrap">
          <TabsTrigger
            value="all"
            data-ocid="category_filter.tab"
            className="text-xs font-medium tracking-wide uppercase px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm"
          >
            All
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              data-ocid="category_filter.tab"
              className="text-xs font-medium tracking-wide px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
