"use client";

import { TaskForm } from "@/components/tasks/task-form";
import { useLanguage } from "@/contexts/language-context";

export default function NewTaskPage() {
    const { t } = useLanguage();
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-headline font-bold mb-6">{t('createNewTask')}</h1>
            <TaskForm />
        </div>
    );
}
