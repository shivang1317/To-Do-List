
window.addEventListener('load', () => {
    const form = document.querySelector("#f1");
    const input = document.querySelector("#inf");
    const dateInput = document.querySelector("#date");
    const categorySelect = document.querySelector("#category");
    const list_el = document.querySelector("#tasks");
    const sortingControls = document.querySelector("#sorting-controls");
    const tasks = []; 
    const filterCategory = document.querySelector("#filter-category");
    const filterButton = document.querySelector("#filter-button");
    const searchInput = document.querySelector("#search-input");
    //const searchButton = document.querySelector("#search-button");
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    

const searchRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();


searchRecognition.lang = 'en-US'; 
searchRecognition.interimResults = false; 

// Event handler for when speech is recognized for search
searchRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript; // Set the search input field with the recognized speech
    searchTasks(); // Call the search function immediately
};

// Event handler for search recognition errors
searchRecognition.onerror = (event) => {
    console.error('Search recognition error:', event.error);
};



// Start search recognition when the "Start Voice Search" button is clicked
document.getElementById('start-voice-search-button').addEventListener('click', () => {
    searchRecognition.start();
});


    const saveTasksToLocalStorage = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Function to add a task to the DOM
    const addTaskToDOM = (taskObj) => {
        const task_el = document.createElement('div');
        task_el.classList.add('task');

        const taskContent = document.createElement('div');
        taskContent.classList.add('content');

        const task_description = document.createElement('p');
        task_description.textContent = ` (Date: ${taskObj.taskDate}, Category: ${taskObj.category})`;

        taskContent.appendChild(task_description);

        const taskInput = document.createElement('input');
        taskInput.classList.add('text');
        taskInput.type = 'text';
        taskInput.value = taskObj.task;
        taskInput.setAttribute('readonly', 'readonly');

        taskContent.appendChild(taskInput);

        const taskAction = document.createElement('div');
        taskAction.classList.add('actions');

        const taskEdit = document.createElement('button');
        taskEdit.classList.add('edit');
        taskEdit.innerText = 'Edit';

        const task_complete_el = document.createElement('button');
        task_complete_el.classList.add('complete');
        task_complete_el.innerText = 'Complete';

        const taskDelete = document.createElement('button');
        taskDelete.classList.add('delete');
        taskDelete.innerText = 'Delete';

        taskAction.appendChild(taskEdit);
        taskAction.appendChild(task_complete_el);
        taskAction.appendChild(taskDelete);

        task_el.appendChild(taskContent);
        task_el.appendChild(taskAction);

        list_el.appendChild(task_el);

        if (taskObj.completed) {
            task_el.classList.add("completed");
        } else {
            task_el.classList.remove("completed");
        }

        // Task completion functionality
        task_complete_el.addEventListener('click', () => {
            taskObj.completed = !taskObj.completed;
            task_el.classList.toggle('completed', taskObj.completed);
            saveTasksToLocalStorage();
        });

        taskEdit.addEventListener('click', (e) => {
            if (taskEdit.innerText.toLowerCase() == "edit") {
                taskEdit.innerText = "Save";
                taskInput.removeAttribute("readonly");
                taskInput.focus();
            } else {
                taskEdit.innerText = "Edit";
                taskInput.setAttribute("readonly", "readonly");
                tasks.find((task) => {
                    if (task.task == taskObj.task) {
                        task.task = taskInput.value;
                    }
                });
                saveTasksToLocalStorage();
            }
        });

        taskDelete.addEventListener('click', (e) => {
            list_el.removeChild(task_el);
            const index = tasks.findIndex(item => item === taskObj);
            if (index !== -1) {
                tasks.splice(index, 1);
                saveTasksToLocalStorage();
            }
        });
    };

    // Function to sort and display tasks
    const displaySortedTasks = (sortedTasks) => {
        // Clear the current task list
        list_el.innerHTML = '';

        // Display the sorted tasks
        sortedTasks.forEach((taskObj) => {
            addTaskToDOM(taskObj);
        });
    };

    // Function to filter and display tasks based on the search query
    const searchTasks = () => {
        const searchQuery = searchInput.value.toLowerCase();
        const matchedTasks = tasks.filter(task =>
            task.task.toLowerCase().includes(searchQuery) ||
            task.category.toLowerCase().includes(searchQuery) ||
            task.taskDate.toLowerCase().includes(searchQuery)
        );
        // Display the matched tasks
        displaySortedTasks(matchedTasks);
    };

    // Event listener for the search button
    searchInput.addEventListener('input', searchTasks);

    // Event listener for the form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const task = input.value;
        const taskDate = dateInput.value;
        const category = categorySelect.value;


        const currentDate = new Date();
        const selectedDate = new Date(taskDate);
        if (selectedDate < currentDate) {
            alert("Please select a future date for the task.");
            return;
        }
        
        const taskObj = { task, taskDate, category, completed: false };
        tasks.push(taskObj);
        saveTasksToLocalStorage();
        addTaskToDOM(taskObj);
        input.value = '';
        dateInput.value = '';
    });

    // Event listener for sorting by due date
    document.getElementById('sort-by-due-date').addEventListener('click', () => {
        const sortedByDueDate = [...tasks].sort((a, b) => new Date(a.taskDate) - new Date(b.taskDate));
        displaySortedTasks(sortedByDueDate);
    });

    // Event listener for sorting by completion status
    document.getElementById('sort-by-completion').addEventListener('click', () => {
        const sortedByCompletion = [...tasks].sort((a, b) => a.completed ? 1 : -1);
        displaySortedTasks(sortedByCompletion);
    });

    // Event listener for sorting by category
    document.getElementById('sort-by-category').addEventListener('click', () => {
        const sortedByCategory = [...tasks].sort((a, b) => a.category.localeCompare(b.category));
        displaySortedTasks(sortedByCategory);
    });

    // Event listener for the filter button
    filterButton.addEventListener('click', () => {
        const selectedCategory = filterCategory.value;
        let filteredTasks;
        if (selectedCategory === "all") {
            filteredTasks = tasks;
        } else {
            filteredTasks = tasks.filter(task => task.category === selectedCategory);
        }
        displaySortedTasks(filteredTasks);
    });


    // Populate the task list from local storage and add to the tasks array
    storedTasks.forEach((taskObj) => {
        tasks.push(taskObj);
        addTaskToDOM(taskObj);
    });
});

function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2,'0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;
        document.getElementById('clockDisplay').textContent = time;
    }

    setInterval(updateClock, 1000);