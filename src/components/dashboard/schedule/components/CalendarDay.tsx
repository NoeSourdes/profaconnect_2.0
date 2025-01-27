"use client";

import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  colorClasses15,
  colorClassesBorderClean,
  colorClassesClean,
} from "../../../../../app/(dashboard)/schedule/color";
import { deleteEventAction } from "../../../../../app/(dashboard)/schedule/events/event.action";
import { checkHour } from "../../../../../app/(dashboard)/schedule/hour";
import { EventType } from "../../../../../app/(dashboard)/schedule/types/events-type";
import { ModalEventForm } from "./ModalEventForm";
import { Time } from "./time/time";

export type CalendarDayProps = {
  date: Date;
  events: EventType[];
};

export const CalendarDay = (props: CalendarDayProps) => {
  const listHours = Array.from(
    { length: 25 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`
  );

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (idEvent: { id: string }) => {
      const result = await deleteEventAction(idEvent.id);

      if (!result || result.serverError || !result.data) {
        throw new Error(
          result?.serverError || "Une erreur inconnue est survenue"
        );
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Événement supprimé avec succès");

      queryClient.invalidateQueries({
        queryKey: ["events", props.events[0]?.authorId],
      });
    },
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [topBlockTime, setTopBlockTime] = useState(0);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = props.date.toLocaleDateString("fr-FR", options);

  const transformDate = (date: string) => {
    const hours = date.slice(0, 2);
    const minutes = date.slice(3, 5);
    const newMinutes = Math.floor((parseInt(minutes) * 100) / 60);
    const string = `${hours}.${newMinutes}`;
    setTopBlockTime(parseFloat(string));
    return parseFloat(string);
  };

  useEffect(() => {
    const new_date = new Date();
    transformDate(new_date.toLocaleTimeString().slice(0, 5));
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const new_date = new Date();
      setCurrentTime(new_date);
      const time = transformDate(new_date.toLocaleTimeString().slice(0, 5));
      setTopBlockTime(time);
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const getEventPosition = (event: any) => {
    const eventDate = new Date(event.date);
    if (eventDate.toDateString() !== props.date.toDateString()) return null;

    const startTime = JSON.parse(event.start);
    const endTime = JSON.parse(event.end);
    const startHours = startTime.hour + startTime.minute / 60;
    const endHours = endTime.hour + endTime.minute / 60;
    const top = (startHours / 24) * 100;
    const height = ((endHours - startHours) / 24) * 100;

    return { top, height, startHours, endHours };
  };

  return (
    <div className="w-full h-full">
      <section className="pb-2">
        <div className="flex justify-center ml-10 max-sm:ml-9">
          <div
            className={`text-xs font-medium text-muted-foreground w-full h-full flex items-center justify-center ${
              new Date().toDateString() === props.date.toDateString()
                ? "text-primary"
                : ""
            }`}
          >
            {formattedDate}
          </div>
        </div>
      </section>
      <section className="flex max-h-[640px] h-full w-full overflow-y-auto border rounded-lg overflow-x-hidden relative bg-background">
        <div
          className={`absolute left-1 max-sm:left-[2px] right-0`}
          style={{
            top: `${topBlockTime * 40 + 12}px`,
          }}
        >
          <Time currentTime={currentTime} setCurrentTime={setCurrentTime} />
        </div>
        <div
          className="absolute right-0 left-[43px] max-sm:left-[37.5px] z-50"
          style={{
            top: `${topBlockTime * 40 + 19.5}px`,
            height: "1px",
          }}
        >
          <div className="h-full w-full flex">
            <div className="h-full w-full relative bg-destructive">
              <span className="absolute h-2 w-2 rounded-full -top-[3.5px] bg-destructive"></span>
            </div>
          </div>
        </div>
        <div className="h-full ml-1">
          {listHours.map((hour, index) => (
            <div
              key={hour}
              className="text-xs max-sm:text-[10px] font-medium text-muted-foreground h-10 flex items-center justify-center"
            >
              {index === 24 ? "00:00" : hour}
            </div>
          ))}
        </div>
        <div className="h-full grow pt-5 ml-1 relative">
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className={`h-10 border-b flex ${index == 0 ? "border-t " : ""}`}
            >
              <div className="h-full w-full flex">
                <div className="h-full w-full "></div>
              </div>
            </div>
          ))}
          {props.events.map((event) => {
            const position = getEventPosition(event);
            if (!position) return null;

            const eventsSameDay = props.events.filter(
              (e) =>
                new Date(e.date).getTime() === new Date(event.date).getTime()
            );

            const eventsOverlapping = eventsSameDay.filter((e) => {
              const eventPos = getEventPosition(e);
              if (!eventPos) return false;
              return (
                (eventPos.startHours < position.endHours &&
                  eventPos.startHours >= position.startHours) ||
                (position.startHours < eventPos.endHours &&
                  position.startHours >= eventPos.startHours)
              );
            });

            const eventIndex = eventsOverlapping.findIndex(
              (e) => e.id === event.id
            );
            const eventCount = eventsOverlapping.length;

            const eventWidth = `calc(${100 / eventCount}%)`;
            const eventLeft = `calc(${eventIndex * (100 / eventCount)}%)`;

            return (
              <Popover key={event.id}>
                <PopoverTrigger asChild>
                  <div
                    className={`absolute rounded mt-[20px]`}
                    style={{
                      top: `${position.startHours * 40}px`,
                      height: `calc(${position.height}% + 1px)`,
                      left: eventLeft,
                      width: eventWidth,
                    }}
                  >
                    <div
                      className={`w-full h-full border-2 rounded overflow-hidden px-1 cursor-pointer ${
                        colorClasses15[
                          event.color as keyof typeof colorClasses15
                        ]
                      } ${
                        colorClassesBorderClean[
                          event.color as keyof typeof colorClassesBorderClean
                        ]
                      }`}
                    >
                      <p className="font-medium text-sm overflow-hidden text-nowrap">
                        {event.title}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground text-nowrap">
                        {checkHour(event.startTime)} -{" "}
                        {checkHour(event.endTime)}
                      </p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="max-w-56 p-2 space-y-2 z-50">
                  <div className="px-1">
                    <div className="flex items-center gap-1 ">
                      <span
                        className={`w-1 h-4 ${
                          colorClassesClean[
                            event.color as keyof typeof colorClassesClean
                          ]
                        }`}
                      ></span>

                      <p className="font-medium">{event.title}</p>
                    </div>
                    <p className="text-muted-foreground font-semibold text-xs">
                      {checkHour(event.startTime)} - {checkHour(event.endTime)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {event.description
                        ? event.description
                        : "Pas de description"}
                    </p>
                  </div>
                  <ModalEventForm
                    defaultValues={{
                      ...event,
                      description: event.description ?? undefined,
                      categoryId: event.categoryId ?? undefined,
                    }}
                    id={event.id}
                  />
                  <div className="flex flex-col gap-3">
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-start gap-2 hover:text-destructive tramsition-colors"
                      variant="ghost"
                      onClick={() => {
                        deleteMutation.mutate({ id: event.id });
                      }}
                    >
                      <Trash size={18} />
                      Supprimer l'événement
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </section>
    </div>
  );
};
