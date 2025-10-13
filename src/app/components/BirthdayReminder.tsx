"use client";

import { useEffect, useState } from "react";
import { Cake } from "lucide-react";
import { UserWithMedicalHistory } from "@/types/user";

interface UserWithBirthday extends UserWithMedicalHistory {
    daysUntilBirthday: number;
    upcomingAge: number;
    isToday: boolean;
    isThisWeek: boolean;
}

export default function BirthdayReminder() {
    const [birthdays, setBirthdays] = useState<UserWithBirthday[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBirthdays();
    }, []);

    const fetchBirthdays = async () => {
        try {
            const res = await fetch("/api/users");
            const users: UserWithMedicalHistory[] = await res.json();


            // Filter users with date_of_birth and calculate days until birthday
            const usersWithBirthdays = users
                .filter((user) => user.date_of_birth) // Only users with birthday data
                .map((user) => {
                    const today = new Date();
                    const birthDate = new Date(user.date_of_birth!);

                    // Calculate upcoming birthday (this year or next year)
                    const thisYearBirthday = new Date(
                        today.getFullYear(),
                        birthDate.getMonth(),
                        birthDate.getDate()
                    );

                    let nextBirthday = thisYearBirthday;
                    if (thisYearBirthday < today) {
                        // If birthday already passed this year, use next year
                        nextBirthday = new Date(
                            today.getFullYear() + 1,
                            birthDate.getMonth(),
                            birthDate.getDate()
                        );
                    }

                    // Calculate days until birthday
                    const diffTime = nextBirthday.getTime() - today.getTime();
                    const daysUntilBirthday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    // Calculate upcoming age
                    const upcomingAge = nextBirthday.getFullYear() - birthDate.getFullYear();

                    // Check if birthday is today or this week
                    const isToday = daysUntilBirthday === 0;
                    const isThisWeek = daysUntilBirthday > 0 && daysUntilBirthday <= 7;

                    return {
                        ...user,
                        daysUntilBirthday,
                        upcomingAge,
                        isToday,
                        isThisWeek,
                    } as UserWithBirthday;
                })
                .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday); // Sort by closest birthday first

            setBirthdays(usersWithBirthdays);
        } catch (error) {
            console.error("Error fetching birthdays:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatBirthDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="card p-6 mt-6">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Cake className="h-6 w-6" />
                    Upcoming Birthdays
                </h2>
                <p>Loading birthdays...</p>
            </div>
        );
    }

    if (birthdays.length === 0) {
        return (
            <div className="card p-6 mt-6">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Cake className="h-6 w-6" />
                    Upcoming Birthdays
                </h2>
                <p className="text-gray-500 text-center py-8">
                    No upcoming birthdays to display.
                </p>
            </div>
        );
    }

    return (
        <div className="card p-6 mt-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Cake className="h-6 w-6" />
                Upcoming Birthdays
            </h2>

            <div className="flex flex-wrap gap-4">
                {birthdays.map((user) => (
                    <div
                        key={user.id}
                        className={`p-4 rounded-lg border-2 transition-all w-[230px]`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className="font-semibold text-lg truncate">
                                    {user.fname} {user.lname}
                                </h3>
                            </div>
                            <Cake
                                className={`h-6 w-6 flex-shrink-0 ${user.isToday
                                    ? "text-yellow-600"
                                    : user.isThisWeek
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                    }`}
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-gray-400">Days Left</p>
                                <p
                                    className="text-sm font-semibold"
                                >
                                    {user.isToday
                                        ? "🎉 Today!"
                                        : `${user.daysUntilBirthday} ${user.daysUntilBirthday === 1 ? "day" : "days"
                                        }`}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-400">Birthday</p>
                                <p className="text-sm">
                                    {formatBirthDate(user.date_of_birth!)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-400">Turning</p>
                                <p className="text-sm font-semibold">
                                    {user.upcomingAge} years old
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
