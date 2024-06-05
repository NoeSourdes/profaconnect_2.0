import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { AlignJustify, LayoutGrid } from "lucide-react";
import { useViewSelect } from "./viewSelect.store";

export type ViewSelectProps = {};

export const ViewSelect = (props: ViewSelectProps) => {
  const { view, setView } = useViewSelect();
  return (
    <div>
      <Tabs defaultValue={view} onValueChange={(value) => setView(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid_view">
            <LayoutGrid size={20} />
          </TabsTrigger>
          <TabsTrigger value="list_view">
            <AlignJustify size={20} />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};