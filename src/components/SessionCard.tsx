import React from "react";
import { Video, MapPin } from "lucide-react";

export interface SessionCardProps {
  client: string;
  startTime: string;
  endTime: string;
  sessionType: "online" | "presencial";
  status: "confirmado" | "pendente";
  className?: string;
}

const SessionCard: React.FC<SessionCardProps> = ({
  client,
  startTime,
  endTime,
  sessionType,
  status,
  className = ""
}) => {
  const SessionIcon = sessionType === "online" ? Video : MapPin;
  return (
    <div
      className={`h-full p-2 rounded-lg transition-all duration-200 border-l-4 shadow-sm flex flex-col gap-1 bg-white ${className}`}
      style={{
        backgroundColor:
          status === "confirmado"
            ? "rgba(52, 116, 116, 0.1)"
            : "rgba(244, 162, 97, 0.1)",
        borderLeftColor: status === "confirmado" ? "#347474" : "#F4A261"
      }}
    >
      <div className="flex items-center gap-2">
        <SessionIcon size={18} />
        <div className="font-medium flex-1 truncate">{client}</div>
      </div>
      <span className="text-xs text-muted-foreground">
        {startTime} - {endTime}
      </span>
    </div>
  );
};

export default SessionCard;
