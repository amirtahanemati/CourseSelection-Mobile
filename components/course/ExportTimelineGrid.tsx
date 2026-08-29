import React from "react";
import { View } from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import { parseTimeToMinutes } from "../../utils/helpers";
import Text from "../ui/CustomText";

const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const COLORS = [
  { border: "#d946ef", bg: "rgba(217,70,239,0.12)" },
  { border: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  { border: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  { border: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { border: "#0ea5e9", bg: "rgba(14,165,233,0.12)" },
  { border: "#a855f7", bg: "rgba(168,85,247,0.12)" },
];

export default function ExportTimelineGrid() {
  const courses = useCourseStore((state) => state.courses) || [];
  const isDark = useCourseStore((state) => state.theme) === "dark";

  const theme = {
    bg: isDark ? "#090a0f" : "#f3f4f6",
    cardBg: isDark ? "#090a0f" : "#ffffff",
    headerBg: isDark ? "#12141c" : "#f9fafb",
    border: isDark ? "#1f222a" : "#e5e7eb",
    textMain: isDark ? "white" : "#111827",
    textSub: isDark ? "#d1d5db" : "#4b5563",
    textMuted: isDark ? "#6b7280" : "#9ca3af",
    badgeBg: isDark ? "rgba(59,130,246,0.1)" : "#eff6ff",
    badgeBorder: isDark ? "rgba(59,130,246,0.2)" : "#bfdbfe",
    timeBoxBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    timeText: isDark ? "#e4e4e7" : "#374151",
  };

  const MIN_HOUR = 8;
  const HOUR_HEIGHT = 120;
  const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;
  const COL_WIDTH = 190;
  const TIME_COL_WIDTH = 80;
  const HEADER_HEIGHT = 70;

  return (
    <View
      collapsable={false}
      style={{
        width: TIME_COL_WIDTH + DAYS.length * COL_WIDTH + 64,
        backgroundColor: theme.bg,
        padding: 32,
      }}
    >
      <View
        style={{
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 24,
          paddingHorizontal: 8,
        }}
      >
        <View>
          <Text
            style={{
              color: theme.textMain,
              fontSize: 28,
              fontWeight: "900",
              marginBottom: 6,
            }}
          >
            برنامه هفتگی کلاس‌ها
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: 16 }}>
            ساخته شده توسط ابزار جامع انتخاب واحد
          </Text>
        </View>
        <View
          style={{
            backgroundColor: theme.badgeBg,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.badgeBorder,
          }}
        >
          <Text style={{ color: "#3b82f6", fontSize: 14, fontWeight: "bold" }}>
            {new Date().toLocaleDateString("fa-IR")}
          </Text>
        </View>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 16,
          backgroundColor: theme.cardBg,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row-reverse",
            height: HEADER_HEIGHT,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            backgroundColor: theme.headerBg,
          }}
        >
          <View style={{ width: TIME_COL_WIDTH }} />
          {DAYS.map((day, idx) => (
            <View
              key={day}
              style={{
                width: COL_WIDTH,
                justifyContent: "center",
                alignItems: "center",
                borderLeftWidth: idx === DAYS.length - 1 ? 0 : 1,
                borderLeftColor: theme.border,
              }}
            >
              <Text
                style={{
                  color: theme.textSub,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: "row-reverse" }}>
          <View
            style={{
              width: TIME_COL_WIDTH,
              borderLeftWidth: 1,
              borderLeftColor: theme.border,
            }}
          >
            {HOURS.map((hour) => (
              <View
                key={hour}
                style={{ height: HOUR_HEIGHT, alignItems: "center" }}
              >
                {/* 👈 تنظیم marginTop به -2 تا ساعت کاملا در خط تراز شود و به بالا نچسبد */}
                <Text
                  style={{
                    color: theme.textMuted,
                    fontSize: 13,
                    marginTop: -2,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  }}
                >
                  {`${hour.toString().padStart(2, "0")}:00`}
                </Text>
              </View>
            ))}
          </View>

          {DAYS.map((day, dayIndex) => (
            <View
              key={day}
              style={{
                width: COL_WIDTH,
                borderLeftWidth: dayIndex === DAYS.length - 1 ? 0 : 1,
                borderLeftColor: theme.border,
                position: "relative",
              }}
            >
              {HOURS.map((hour, idx) => (
                <View
                  key={hour}
                  style={{
                    height: HOUR_HEIGHT,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: theme.border,
                    borderStyle: "dashed",
                  }}
                />
              ))}

              {courses.map((course, courseIndex) => {
                const sessions = course.sessions.filter((s) => s.day === day);
                if (sessions.length === 0) return null;
                const color = COLORS[courseIndex % COLORS.length];

                return sessions.map((session, sIdx) => {
                  const startMins = parseTimeToMinutes(session.start);
                  const endMins = parseTimeToMinutes(session.end);
                  const topOffset =
                    (startMins - MIN_HOUR * 60) * PIXELS_PER_MINUTE;
                  const height = (endMins - startMins) * PIXELS_PER_MINUTE;

                  return (
                    <View
                      key={`${course.id}-${sIdx}`}
                      style={{
                        position: "absolute",
                        top: topOffset + 4,
                        left: 8,
                        right: 8,
                        height: height - 8,
                        backgroundColor: isDark ? color.bg : "white",
                        borderWidth: 2,
                        borderColor: color.border,
                        borderRadius: 16,
                        padding: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        shadowColor: color.border,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isDark ? 0 : 0.1,
                        shadowRadius: 8,
                        elevation: isDark ? 0 : 3,
                      }}
                    >
                      <Text
                        style={{
                          color: isDark ? "white" : "#111827",
                          fontWeight: "900",
                          fontSize: 16,
                          textAlign: "center",
                          marginBottom: 12,
                          lineHeight: 24,
                        }}
                      >
                        {course.name}
                      </Text>
                      <View
                        style={{
                          backgroundColor: theme.timeBoxBg,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 10,
                          marginBottom: course.exam_date ? 8 : 0,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.timeText,
                            fontSize: 13,
                            fontFamily: "monospace",
                            fontWeight: "bold",
                          }}
                        >
                          {session.end} - {session.start}
                        </Text>
                      </View>
                      {course.exam_date && (
                        <Text
                          style={{
                            color: isDark ? "#60a5fa" : "#2563eb",
                            fontSize: 11,
                            fontWeight: "bold",
                            marginTop: 4,
                          }}
                        >
                          {course.exam_date}{" "}
                          {course.exam_time ? `\n${course.exam_time}` : ""}
                        </Text>
                      )}
                    </View>
                  );
                });
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
