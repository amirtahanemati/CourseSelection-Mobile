import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Edit2,
  Plus,
  Save,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useCourseStore } from "../../store/useCourseStore";
import { Session } from "../../types";
import {
  overlap,
  parseTimeToMinutes,
  toEnglishDigits,
} from "../../utils/helpers";
import Text from "../ui/CustomText";
import TextInput from "../ui/CustomTextInput";
import DatePickerModal from "../ui/DatePickerModal";
import TimePickerModal from "../ui/TimePickerModal";
import WheelPicker from "../ui/WheelPicker";

const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];
const initialSession: Session = { day: DAYS[0], start: "08:00", end: "10:00" };

export default function CourseForm() {
  const {
    courses,
    addCourse,
    updateCourse,
    selectedCourseId,
    setSelectedCourseId,
    theme,
  } = useCourseStore();
  const isDark = theme === "dark";

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [professor, setProfessor] = useState("");
  const [units, setUnits] = useState("");

  const [noExam, setNoExam] = useState(false);
  const [examDate, setExamDate] = useState("1403/03/20");
  const [examTime, setExamTime] = useState("08:30");
  const [sessions, setSessions] = useState<Session[]>([{ ...initialSession }]);

  // تنظیمات مودال‌ها
  const [timePicker, setTimePicker] = useState<{
    visible: boolean;
    target: "exam" | "start" | "end";
    index?: number;
    time: string;
  }>({ visible: false, target: "exam", time: "" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dayPicker, setDayPicker] = useState<{
    visible: boolean;
    index: number;
    day: string;
  }>({ visible: false, index: 0, day: DAYS[0] });

  // بارگذاری اطلاعات هنگام ویرایش
  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find((c) => c.id === selectedCourseId);
      if (course) {
        setCode(course.code);
        setName(course.name);
        setProfessor(course.professor || "");
        setUnits(course.units ? course.units.toString() : "");
        setNoExam(course.exam_date === null);
        setExamDate(course.exam_date || "1403/03/20");
        setExamTime(course.exam_time || "08:30");
        setSessions(JSON.parse(JSON.stringify(course.sessions)));
      }
    } else {
      setCode("");
      setName("");
      setProfessor("");
      setUnits("");
      setNoExam(false);
      setSessions([{ ...initialSession }]);
    }
  }, [selectedCourseId, courses]);

  const updateSession = (
    index: number,
    field: keyof Session,
    value: string,
  ) => {
    const newSessions = [...sessions];
    newSessions[index][field] = value;
    setSessions(newSessions);
  };

  const checkConflict = (newSessions: Session[], ignoreId: number | null) => {
    for (const newSess of newSessions) {
      if (!newSess.start || !newSess.end) continue;
      const st = parseTimeToMinutes(newSess.start);
      const en = parseTimeToMinutes(newSess.end);

      for (const course of courses) {
        if (course.id === ignoreId) continue;
        for (const existSess of course.sessions) {
          if (
            existSess.day === newSess.day &&
            overlap(
              st,
              en,
              parseTimeToMinutes(existSess.start),
              parseTimeToMinutes(existSess.end),
            )
          ) {
            return course.name;
          }
        }
      }
    }
    return null;
  };

  const handleSubmit = () => {
    if (!name || !code)
      return Toast.show({ type: "error", text1: "نام و کد درس الزامی است." });

    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      if (!s.start || !s.end)
        return Toast.show({
          type: "error",
          text1: `ساعت شروع و پایان جلسه ${i + 1} الزامی است.`,
        });
      if (parseTimeToMinutes(s.start) >= parseTimeToMinutes(s.end)) {
        return Toast.show({
          type: "error",
          text1: `در جلسه ${i + 1}، پایان باید بعد از شروع باشد.`,
        });
      }
    }

    const conflict = checkConflict(sessions, selectedCourseId);
    if (conflict)
      return Toast.show({
        type: "error",
        text1: `تداخل زمانی با درس "${conflict}"!`,
      });

    const courseData = {
      code,
      name,
      professor,
      units: parseFloat(units) || 0,
      exam_date: noExam ? null : examDate,
      exam_time: noExam ? null : examTime,
      sessions,
    };

    if (selectedCourseId) {
      updateCourse(selectedCourseId, courseData);
      Toast.show({ type: "success", text1: "درس با موفقیت ویرایش شد." });
      setSelectedCourseId(null);
    } else {
      addCourse({ id: Date.now(), ...courseData });
      Toast.show({ type: "success", text1: "درس با موفقیت اضافه شد." });
      setCode("");
      setName("");
      setProfessor("");
      setUnits("");
      setNoExam(false);
      setSessions([{ ...initialSession }]);
    }
  };

  const handleTimeConfirm = (time: string) => {
    if (timePicker.target === "exam") setExamTime(time);
    else if (timePicker.target === "start" && timePicker.index !== undefined)
      updateSession(timePicker.index, "start", time);
    else if (timePicker.target === "end" && timePicker.index !== undefined)
      updateSession(timePicker.index, "end", time);
    setTimePicker({ ...timePicker, visible: false });
  };

  return (
    <View
      className={`border rounded-3xl p-5 mb-6 shadow-sm z-10 ${isDark ? "bg-[#12141c] border-[#1f222a]" : "bg-white border-gray-200"}`}
    >
      <View
        className="flex-row items-center justify-between mb-6 border-b pb-4"
        style={{ borderColor: isDark ? "#1f222a" : "#e5e7eb" }}
      >
        {selectedCourseId ? (
          <TouchableOpacity
            onPress={() => setSelectedCourseId(null)}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <Text className="text-red-500 text-xs font-bold">لغو ویرایش</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <Text className="text-lg font-extrabold text-blue-500 text-right">
          {selectedCourseId ? "ویرایش درس" : "افزودن درس جدید"}
        </Text>
      </View>

      <View className="flex-col gap-4 mb-6">
        <View>
          <Text
            className={`text-xs mb-2 mr-1 text-right font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            کد درس
          </Text>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(toEnglishDigits(t))}
            className={`border rounded-2xl h-14 px-4 font-mono text-left ${isDark ? "bg-[#1a1c23] border-[#272a35] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
            placeholder="e.g: 40123"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          />
        </View>
        <View>
          <Text
            className={`text-xs mb-2 mr-1 text-right font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            نام درس
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className={`border rounded-2xl h-14 px-4 text-right font-medium ${isDark ? "bg-[#1a1c23] border-[#272a35] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
            placeholder="مثال: برنامه‌نویسی پیشرفته"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          />
        </View>
        <View>
          <Text
            className={`text-xs mb-2 mr-1 text-right font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            نام استاد
          </Text>
          <TextInput
            value={professor}
            onChangeText={setProfessor}
            className={`border rounded-2xl h-14 px-4 text-right font-medium ${isDark ? "bg-[#1a1c23] border-[#272a35] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
            placeholder="دکتر ...."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          />
        </View>
        <View>
          <Text
            className={`text-xs mb-2 mr-1 text-right font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            تعداد واحد
          </Text>
          <TextInput
            value={units}
            onChangeText={(t) => setUnits(toEnglishDigits(t))}
            keyboardType="numeric"
            className={`border rounded-2xl h-14 px-4 text-center font-mono ${isDark ? "bg-[#1a1c23] border-[#272a35] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
            placeholder="3"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          />
        </View>
      </View>

      {/* بخش امتحان */}
      <View
        className={`border p-4 rounded-2xl mb-6 ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50/50 border-gray-200"}`}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setNoExam(!noExam)}
          className="flex-row-reverse items-center justify-start mb-4"
        >
          <View
            className={`w-5 h-5 rounded border ml-3 items-center justify-center ${noExam ? "bg-blue-500 border-blue-500" : isDark ? "border-gray-500" : "border-gray-300 bg-white"}`}
          >
            {noExam && <Check size={14} color="white" />}
          </View>
          <Text
            className={`text-sm font-bold text-right ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            این درس امتحان ندارد
          </Text>
        </TouchableOpacity>

        <View
          className={`flex-col gap-4 ${noExam ? "opacity-30" : "opacity-100"}`}
        >
          <View>
            <Text
              className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              تاریخ امتحان
            </Text>
            <TouchableOpacity
              disabled={noExam}
              onPress={() => setIsDatePickerOpen(true)}
              className={`border rounded-2xl h-14 px-4 flex-row items-center justify-between ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
            >
              <CalendarDays size={18} color={isDark ? "#6b7280" : "#9ca3af"} />
              <Text
                className={`font-mono text-base ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {examDate}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text
              className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              ساعت امتحان
            </Text>
            <TouchableOpacity
              disabled={noExam}
              onPress={() =>
                setTimePicker({ visible: true, target: "exam", time: examTime })
              }
              className={`border rounded-2xl h-14 px-4 flex-row items-center justify-between ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
            >
              <Clock size={18} color={isDark ? "#6b7280" : "#9ca3af"} />
              <Text
                className={`font-mono text-base ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {examTime}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* بخش جلسات */}
      <View className="mb-6">
        <Text
          className={`text-sm font-extrabold mb-4 text-right ${isDark ? "text-white" : "text-gray-800"}`}
        >
          جلسات کلاس
        </Text>

        {sessions.map((session, index) => (
          <View
            key={index}
            className={`border p-4 rounded-2xl mb-3 ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50/50 border-gray-200"}`}
          >
            {sessions.length > 1 && (
              <TouchableOpacity
                onPress={() =>
                  setSessions(sessions.filter((_, i) => i !== index))
                }
                className="absolute top-3 left-3 z-10 p-1.5 rounded-md bg-red-500/10 border border-red-500/20"
              >
                <X size={14} color="#ef4444" />
              </TouchableOpacity>
            )}
            <View className="mb-4">
              <Text
                className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                روز هفته
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setDayPicker({ visible: true, index, day: session.day })
                }
                className={`h-14 rounded-xl flex-row items-center justify-between px-4 border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
              >
                <ChevronDown size={20} color={isDark ? "#6b7280" : "#9ca3af"} />
                <Text
                  className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                >
                  {session.day}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row-reverse gap-3">
              <View className="flex-1">
                <Text
                  className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  ساعت شروع
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setTimePicker({
                      visible: true,
                      target: "start",
                      index,
                      time: session.start,
                    })
                  }
                  className={`border rounded-2xl h-12 px-3 flex-row items-center justify-between ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
                >
                  <Clock size={14} color={isDark ? "#6b7280" : "#9ca3af"} />
                  <Text
                    className={`font-mono text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {session.start}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <Text
                  className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  ساعت پایان
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setTimePicker({
                      visible: true,
                      target: "end",
                      index,
                      time: session.end,
                    })
                  }
                  className={`border rounded-2xl h-12 px-3 flex-row items-center justify-between ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
                >
                  <Clock size={14} color={isDark ? "#6b7280" : "#9ca3af"} />
                  <Text
                    className={`font-mono text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {session.end}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => setSessions([...sessions, { ...initialSession }])}
          className="mt-2 flex-row-reverse items-center justify-start gap-1 p-2"
        >
          <Plus size={14} color="#3b82f6" />
          <Text className="text-blue-500 text-xs font-bold mt-0.5">
            افزودن جلسه دیگر برای این درس
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        className={`border h-14 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] transition-transform ${selectedCourseId ? "bg-gray-800 border-gray-900 dark:bg-gray-100 dark:border-white" : isDark ? "bg-[#0f1115] border-[#1f222a]" : "bg-blue-500 border-blue-600 shadow-md"}`}
      >
        {selectedCourseId ? (
          <Edit2 size={20} color={isDark ? "#090a0f" : "white"} />
        ) : (
          <Save size={20} color="white" />
        )}
        <Text
          className={`font-extrabold text-base ${selectedCourseId && isDark ? "text-[#090a0f]" : "text-white"}`}
        >
          {selectedCourseId ? "ثبت تغییرات ویرایش" : "ذخیره درس"}
        </Text>
      </TouchableOpacity>

      {/* مودال‌های دیالوگ */}
      <TimePickerModal
        visible={timePicker.visible}
        initialTime={timePicker.time}
        onConfirm={handleTimeConfirm}
        onClose={() => setTimePicker({ ...timePicker, visible: false })}
      />
      <DatePickerModal
        visible={isDatePickerOpen}
        initialDate={examDate}
        onConfirm={(d) => {
          setExamDate(d);
          setIsDatePickerOpen(false);
        }}
        onClose={() => setIsDatePickerOpen(false)}
      />

      {/* مودال انتخاب روز */}
      <Modal
        visible={dayPicker.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDayPicker({ ...dayPicker, visible: false })}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <TouchableWithoutFeedback
            onPress={() => setDayPicker({ ...dayPicker, visible: false })}
          >
            <View className="absolute inset-0" />
          </TouchableWithoutFeedback>
          <View
            className={`w-full p-6 rounded-3xl ${isDark ? "bg-[#12141c] border border-[#1f222a]" : "bg-white"}`}
          >
            <Text
              className={`text-lg font-bold text-center mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              انتخاب روز کلاس
            </Text>
            <View
              className={`flex-row-reverse items-center justify-center p-4 rounded-3xl border mb-6 ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <WheelPicker
                items={DAYS}
                selectedValue={dayPicker.day}
                onValueChange={(d) => setDayPicker({ ...dayPicker, day: d })}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                updateSession(dayPicker.index, "day", dayPicker.day);
                setDayPicker({ ...dayPicker, visible: false });
              }}
              className="bg-blue-500 py-3.5 rounded-xl flex-row-reverse items-center justify-center gap-2"
            >
              <Check size={18} color="white" />
              <Text className="text-white font-bold">تأیید روز</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
