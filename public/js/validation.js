// Чекаємо поки сторінка завантажиться
document.addEventListener('DOMContentLoaded', function() {
    
    // Знаходимо форму
    const form = document.getElementById('studentForm');
    
    if (!form) return; // Якщо форми немає на сторінці - виходимо
    
    // Обробка submit форми
    form.addEventListener('submit', function(event) {
        // Перевіряємо валідність форми
        if (!form.checkValidity()) {
            event.preventDefault(); // Зупиняємо відправку
            event.stopPropagation();
        }
        
        // Додаємо клас для показу валідації
        form.classList.add('was-validated');
    });
    
    // Валідація в реальному часі (при введенні)
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(function(input) {
        input.addEventListener('input', function() {
            // Перевіряємо конкретне поле
            if (this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
        
        // При втраті фокуса теж перевіряємо
        input.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            }
        });
    });
    
    // Спеціальна валідація для телефону (форматування)
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Якщо почали вводити, але немає +380
            if (value.length > 0 && !value.startsWith('+380')) {
                // Якщо почали з 0, замінюємо на +380
                if (value.startsWith('0')) {
                    e.target.value = '+38' + value;
                } else if (!value.startsWith('+')) {
                    e.target.value = '+380' + value;
                }
            }
        });
    }
});