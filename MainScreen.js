const { createClient } = window.supabase;
const supabaseURL = "https://lyvswpeeahsowgcrvqco.supabase.co";
const supabaseAnnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dnN3cGVlYWhzb3dnY3J2cWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MjYzOTYsImV4cCI6MjA1MzMwMjM5Nn0.oQaVxbt8WOQ0_GLgJhbV0pg46N6ZWC65OWNIhWFw3KA";
const supabase = createClient(supabaseURL, supabaseAnnonKey);


const tasksJson = [];
const taskArray = JSON.parse(JSON.stringify(tasksJson));


// Logout Button
document.getElementById("logout-Btn").addEventListener("click", (e) => {
    window.location.href = "LogIn.html";
});


// Pomodoro Timer
document.addEventListener("DOMContentLoaded", function () {
    let isRunning = false;
    let workTime = 20 * 60; // 20 minutes
    let breakTime = 5 * 60; // 5 minutes
    let timeLeft = workTime;
    let isBreak = false;
    let timerInterval = null;


    const timerDisplay = document.getElementById("timer");
    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resetBtn = document.getElementById("resetBtn");


    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }


    function updateTimer() {
        timerDisplay.textContent = formatTime(timeLeft);
    }


    function startTimer() {
        console.log("Start clicked");
        if (isRunning) return; // Prevent multiple intervals
        isRunning = true;


        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimer();
            } else {
                isBreak = !isBreak;
                timeLeft = isBreak ? breakTime : workTime;
                alert(isBreak ? "Break Time! ☕" : "Back to Work! ⏳");
                updateTimer();
            }
        }, 1000);
    }


    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
    }


    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        isBreak = false;
        timeLeft = workTime;
        updateTimer();
    }


    // Initialize Timer Display
    updateTimer();


    // Attach Event Listeners
    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);
});


// Notepad


async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    return user;
}


document.getElementById("saveBtn").addEventListener("click", async function () {
    const user = await getUser();
    if (!user) {
        alert("Please log in to save notes.");
        return;
    }


    const noteText = document.querySelector(".notepad textarea").value;


    const { data, error } = await supabase
        .from("OptiLearn")
        .upsert([{ user_id: user.id, notes_content: noteText }]);


    if (error) {
        console.error("Error saving note:", error);
        alert("Failed to save note.");
    } else {
        console.log("Note saved successfully:", data);
        alert("Note saved!");
    }
});


async function loadNotes() {
    const user = await getUser();
    console.log(user["id"]);
    if (!user) {
        console.warn("No user logged in. Notes not loaded.");
        return;
    }


    const { data, error } = await supabase
        .from("OptiLearn")
        .select("notes_content")
        .eq("user_id", user["id"])


    if (error) {
        console.error("Error fetching notes:", error);
        return;
    }


    // Display the latest note in the textarea
    if (data.length > 0) {
        document.querySelector(".notepad textarea").value = data[0].notes_content;
    }
}


document.addEventListener("DOMContentLoaded", loadNotes);


// Task List


// Edit Task
document.addEventListener("DOMContentLoaded", function () {
    // Select all edit buttons
    document.querySelectorAll("button[id^='edit-']").forEach(button => {
        button.addEventListener("click", function () {
            // Get the associated task's list item
            const taskItem = this.closest("li");


            // Extract current task name (excluding the buttons)
            const currentTaskName = taskItem.childNodes[0].textContent.trim();


            // Prompt user for a new task name
            const newTaskName = prompt("Edit Task Name:", currentTaskName);


            // If user provided a new name, update the task
            if (newTaskName) {
                taskItem.childNodes[0].textContent = newTaskName + " ";
            }
        });
    });
});


// Create Task
function displayTask(task) {
    let li = document.createElement("li");
    li.id = `task${task.id}Name`;
    li.textContent = task.name;


    let span = document.createElement("span");


    function createButton(id, text) {
        let button = document.createElement("button");
        button.id = id;
        button.textContent = text;
        return button;
    }


    let editButton = createButton(`edit-${task.id}`, "Edit");
    let deleteButton = createButton(`delete-${task.id}`, "Delete");


    span.appendChild(editButton);
    span.appendChild(deleteButton);
    li.appendChild(span);
    document.getElementById("taskList").appendChild(li);


    deleteButton.addEventListener("click", async function () {
        li.remove();
        const index = taskArray.findIndex(t => t.id === task.id);
        if (index !== -1) {
            taskArray.splice(index, 1);
            await saveTasksToSupabase();
        }
    });


    editButton.addEventListener("click", async function () {
        const newTaskName = prompt("Edit Task Name:", task.name);
        if (newTaskName) {
            task.name = newTaskName;
            li.childNodes[0].textContent = newTaskName + " ";
            li.appendChild(span);
            await saveTasksToSupabase();
        }
    });
}


async function loadTasks() {
    const user = await getUser();
    if (!user) return;


    const { data, error } = await supabase
        .from("OptiLearn")
        .select("tasks")
        .eq("user_id", user.id)
        .single();


    if (error) {
        console.error("Error fetching tasks:", error);
        return;
    }


    // Ensure tasks are properly initialized
    if (!data || !data.tasks) {
        taskArray.length = 0; // Reset array
    } else {
        taskArray.length = 0;
        taskArray.push(...data.tasks); // Load tasks into array
    }


    taskArray.forEach(displayTask);
}


async function saveTasksToSupabase() {
    const user = await getUser();
    if (!user) return;


    const { data, error } = await supabase
        .from("OptiLearn")
        .upsert([
            {
                user_id: user.id,
                tasks: taskArray.length ? taskArray : [] // Ensures an array is always stored
            }
        ]);


    if (error) {
        console.error("Error saving tasks:", error);
    } else {
        console.log("Tasks saved successfully.");
    }
}


document.addEventListener("DOMContentLoaded", function () {
    loadTasks(); // Load tasks when the page loads


    document.getElementById("addTaskBtn").addEventListener("click", async function () {
        const user = await getUser();
        if (!user) {
            alert("Please log in to add tasks.");
            return;
        }


        const taskId = taskArray.length + 1;
        const taskName = `Task ${taskId}`;
        const newTask = { id: taskId, name: taskName };


        taskArray.push(newTask);
        await saveTasksToSupabase();
        displayTask(newTask);
    });




});
