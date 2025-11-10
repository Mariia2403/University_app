const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
const path = require('path');

// Налаштування EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Тестові дані (поки без БД) - більше студентів для тесту пагінації
let students = [
    { id: 1, firstName: 'Марія', lastName: 'Іваненко', age: 20, course: 3, email: 'maria@university.ua', phone: '+380501234567' },
    { id: 2, firstName: 'Іван', lastName: 'Петренко', age: 22, course: 4, email: 'ivan@university.ua', phone: null },
    { id: 3, firstName: 'Олена', lastName: 'Коваленко', age: 19, course: 2, email: 'olena@university.ua', phone: '+380671234567' },
    { id: 4, firstName: 'Андрій', lastName: 'Шевченко', age: 21, course: 3, email: 'andriy@university.ua', phone: null },
    { id: 5, firstName: 'Катерина', lastName: 'Мельник', age: 20, course: 3, email: 'kateryna@university.ua', phone: '+380931234567' },
    { id: 6, firstName: 'Дмитро', lastName: 'Бондаренко', age: 23, course: 4, email: 'dmytro@university.ua', phone: '+380501112233' },
    { id: 7, firstName: 'Софія', lastName: 'Ткаченко', age: 18, course: 1, email: 'sofia@university.ua', phone: null },
    { id: 8, firstName: 'Максим', lastName: 'Кравченко', age: 19, course: 2, email: 'maxim@university.ua', phone: '+380672223344' },
    { id: 9, firstName: 'Анна', lastName: 'Поліщук', age: 21, course: 3, email: 'anna@university.ua', phone: null },
    { id: 10, firstName: 'Олександр', lastName: 'Мороз', age: 22, course: 4, email: 'oleksandr@university.ua', phone: '+380933334455' },
    { id: 11, firstName: 'Юлія', lastName: 'Василенко', age: 20, course: 2, email: 'yulia@university.ua', phone: null },
    { id: 12, firstName: 'Віктор', lastName: 'Литвин', age: 19, course: 1, email: 'viktor@university.ua', phone: '+380504445566' },
    { id: 13, firstName: 'Тетяна', lastName: 'Романенко', age: 21, course: 3, email: 'tetiana@university.ua', phone: null },
    { id: 14, firstName: 'Сергій', lastName: 'Білий', age: 23, course: 4, email: 'sergiy@university.ua', phone: '+380675556677' }
];

// Лічильник для ID
let nextId = 15;

// Правила валідації для студента
const studentValidationRules = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('Ім\'я обов\'язкове')
        .isLength({ min: 2, max: 50 }).withMessage('Ім\'я має містити від 2 до 50 символів')
        .matches(/^[А-Яа-яЁёІіЇїЄєҐґ\s\-]+$/).withMessage('Ім\'я має містити тільки українські літери'),
    
    body('lastName')
        .trim()
        .notEmpty().withMessage('Прізвище обов\'язкове')
        .isLength({ min: 2, max: 50 }).withMessage('Прізвище має містити від 2 до 50 символів')
        .matches(/^[А-Яа-яЁёІіЇїЄєҐґ\s\-]+$/).withMessage('Прізвище має містити тільки українські літери'),
    
    body('age')
        .notEmpty().withMessage('Вік обов\'язковий')
        .isInt({ min: 16, max: 100 }).withMessage('Вік має бути від 16 до 100 років'),
    
    body('course')
        .notEmpty().withMessage('Курс обов\'язковий')
        .isIn(['1', '2', '3', '4']).withMessage('Курс має бути від 1 до 4'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email обов\'язковий')
        .isEmail().withMessage('Введіть коректний email')
        .normalizeEmail(),
    
    body('phone')
        .optional({ checkFalsy: true })
        .matches(/^\+380\d{9}$/).withMessage('Телефон має бути у форматі +380XXXXXXXXX')
];

// ============= МАРШРУТИ =============

// Головна сторінка
app.get('/', (req, res) => {
    res.render('layout', {
        title: 'Головна сторінка',
        body: require('ejs').render(
            require('fs').readFileSync('views/index.ejs', 'utf-8'),
            { userName: 'Маріє' }
        )
    });
});

// Список студентів (з фільтрацією, сортуванням, пагінацією)
app.get('/students', (req, res) => {
    // Отримуємо параметри з URL
    const search = req.query.search || '';
    const courseFilter = req.query.course || '';
    const sortBy = req.query.sort || 'firstName';
    const sortOrder = req.query.order || 'asc';
    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Кількість студентів на сторінці
    
    // 1. ФІЛЬТРАЦІЯ
    let filteredStudents = students;
    
    // Фільтр по імені (пошук)
    if (search) {
        const searchLower = search.toLowerCase();
        filteredStudents = filteredStudents.filter(student => 
            student.firstName.toLowerCase().includes(searchLower) ||
            student.lastName.toLowerCase().includes(searchLower) ||
            student.email.toLowerCase().includes(searchLower)
        );
    }
    
    // Фільтр по курсу
    if (courseFilter) {
        filteredStudents = filteredStudents.filter(student => 
            student.course === parseInt(courseFilter)
        );
    }
    
    // 2. СОРТУВАННЯ
    filteredStudents.sort((a, b) => {
        let compareResult = 0;
        
        if (sortBy === 'firstName') {
            compareResult = a.firstName.localeCompare(b.firstName, 'uk');
        } else if (sortBy === 'lastName') {
            compareResult = a.lastName.localeCompare(b.lastName, 'uk');
        } else if (sortBy === 'age') {
            compareResult = a.age - b.age;
        } else if (sortBy === 'course') {
            compareResult = a.course - b.course;
        } else if (sortBy === 'email') {
            compareResult = a.email.localeCompare(b.email);
        }
        
        // Якщо спадаюче сортування
        return sortOrder === 'desc' ? -compareResult : compareResult;
    });
    
    // 3. ПАГІНАЦІЯ
    const totalStudents = filteredStudents.length;
    const totalPages = Math.ceil(totalStudents / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    
    // Рендеримо сторінку
    res.render('layout', {
        title: 'Список студентів',
        body: require('ejs').render(
            require('fs').readFileSync('views/students.ejs', 'utf-8'),
            { 
                students: paginatedStudents,
                totalStudents: totalStudents,
                currentPage: page,
                totalPages: totalPages,
                search: search,
                courseFilter: courseFilter,
                sortBy: sortBy,
                sortOrder: sortOrder,
                perPage: perPage
            }
        )
    });
});

// Форма створення студента (GET)
app.get('/students/create', (req, res) => {
    res.render('layout', {
        title: 'Додати студента',
        body: require('ejs').render(
            require('fs').readFileSync('views/create.ejs', 'utf-8'),
            { errors: [], formData: {} }
        )
    });
});

// Створення студента (POST)
app.post('/students/create', studentValidationRules, (req, res) => {
    // Перевіряємо помилки валідації
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Якщо є помилки - показуємо форму знову з помилками
        return res.render('layout', {
            title: 'Додати студента',
            body: require('ejs').render(
                require('fs').readFileSync('views/create.ejs', 'utf-8'),
                { 
                    errors: errors.array(),
                    formData: req.body
                }
            )
        });
    }
    
    // Якщо все ОК - створюємо студента
    const newStudent = {
        id: nextId++,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: parseInt(req.body.age),
        course: parseInt(req.body.course),
        email: req.body.email,
        phone: req.body.phone || null
    };
    
    students.push(newStudent);
    
    // Переадресовуємо на список
    res.redirect('/students');
});

// Перегляд студента (GET)
app.get('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id);
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        return res.status(404).send('Студента не знайдено');
    }
    
    res.render('layout', {
        title: `Студент: ${student.firstName} ${student.lastName}`,
        body: require('ejs').render(
            require('fs').readFileSync('views/view.ejs', 'utf-8'),
            { student: student }
        )
    });
});

// Форма редагування студента (GET)
app.get('/students/:id/edit', (req, res) => {
    const studentId = parseInt(req.params.id);
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        return res.status(404).send('Студента не знайдено');
    }
    
    res.render('layout', {
        title: 'Редагувати студента',
        body: require('ejs').render(
            require('fs').readFileSync('views/edit.ejs', 'utf-8'),
            { 
                student: student,
                errors: []
            }
        )
    });
});

// Оновлення студента (POST)
app.post('/students/:id/edit', studentValidationRules, (req, res) => {
    const studentId = parseInt(req.params.id);
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
        return res.status(404).send('Студента не знайдено');
    }
    
    // Перевіряємо помилки валідації
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Якщо є помилки - показуємо форму знову
        const student = students[studentIndex];
        return res.render('layout', {
            title: 'Редагувати студента',
            body: require('ejs').render(
                require('fs').readFileSync('views/edit.ejs', 'utf-8'),
                { 
                    student: {
                        id: student.id,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        age: req.body.age,
                        course: req.body.course,
                        email: req.body.email,
                        phone: req.body.phone
                    },
                    errors: errors.array()
                }
            )
        });
    }
    
    // Оновлюємо дані студента
    students[studentIndex] = {
        id: studentId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: parseInt(req.body.age),
        course: parseInt(req.body.course),
        email: req.body.email,
        phone: req.body.phone || null
    };
    
    // Переадресовуємо на перегляд студента
    res.redirect(`/students/${studentId}`);
});

// Видалення студента (POST)
app.post('/students/:id/delete', (req, res) => {
    const studentId = parseInt(req.params.id);
    students = students.filter(s => s.id !== studentId);
    res.redirect('/students');
});

// Про проєкт
app.get('/about', (req, res) => {
    res.render('layout', {
        title: 'Про проєкт',
        body: require('ejs').render(
            require('fs').readFileSync('views/about.ejs', 'utf-8'),
            { developer: 'Марія' }
        )
    });
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Сервер працює: http://localhost:${PORT}`);
    console.log('📄 Доступні сторінки:');
    console.log('   - http://localhost:3000/');
    console.log('   - http://localhost:3000/students');
    console.log('   - http://localhost:3000/students/create');
    console.log('   - http://localhost:3000/about');
    console.log('\nЩоб зупинити: Ctrl+C');
});