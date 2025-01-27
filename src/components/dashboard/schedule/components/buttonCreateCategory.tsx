"use client";

import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Popover, PopoverContent } from "@/src/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  checkNameCategoryAction,
  createCategoryAction,
} from "../../../../../app/(dashboard)/schedule/category/category.action";
import {
  categorySchema,
  categoryType,
} from "../../../../../app/(dashboard)/schedule/category/category.schema";

export type ButtonCreateCategoryProps = {
  buttonString?: boolean;
  buttonString2?: boolean;
};

export const ButtonCreateCategory = (props: ButtonCreateCategoryProps) => {
  const { data: session } = useSession();

  const handleCheckNameCategory = async (name: string, userId: string) => {
    return await checkNameCategoryAction(name, userId);
  };

  const form = useZodForm({
    schema: categorySchema,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: categoryType) => {
      const check = await handleCheckNameCategory(
        values.name,
        session?.user?.id as string
      );
      if (check) {
        toast.error("Le nom de la catégorie existe déjà");
        return;
      }
      const result = await createCategoryAction(values);

      if (!result || result.serverError || !result.data) {
        throw new Error(
          result?.serverError || "Une erreur inconnue est survenue"
        );
      }

      toast.success("Catégorie ajoutée avec succès");
      return result.data;
    },
    onSuccess: (data) => {
      if (data && session?.user) {
        queryClient.setQueryData(
          ["categories", session.user.id],
          (oldData: any[]) => [...(oldData as any[]), data]
        );
      }
    },
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        {props.buttonString2 ? (
          <Button variant="secondary" className="w-full">
            Créer une catégorie
          </Button>
        ) : (
          <Button
            variant="secondary"
            size={props.buttonString ? "sm" : "icon_sm"}
            className={props.buttonString ? "w-full" : ""}
          >
            {props.buttonString ? "Ajouter une catégorie" : <Plus size={18} />}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="sm:max-w-[425px]">
        <div>
          <h2 className="text-lg font-semibold">Ajouter une catégorie</h2>
        </div>
        <div>
          <Form
            form={form}
            onSubmit={async (values) => {
              await mutation.mutateAsync(values);
            }}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la catégorie</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="
                  Entrez le titre de la catégorie"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-3">
              {mutation.isPending ? "En cours..." : "Ajouter"}
            </Button>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
};
