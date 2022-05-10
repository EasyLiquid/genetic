// *** УТИЛИТЫ ***

// функция округления чисел
function round(_number, afterComma) {
	
	// возврат округлённого числа
	return +(_number.toFixed(afterComma))
}

// функция генерации случайных чисел
function random(min, max, afterComma) {
	
	// округление, парсинг и возврат случайного числа
	return round((Math.random() * (max - min) + min), afterComma)
}


// *** ГЕНЕТИЧЕСКИЙ АЛГОРИТМ ***

// особь
class Individual {
	
	// конструктор класса
	constructor(functionID) {
		
		// ID особи по умолчанию
		this.id = functionID ? functionID : false
		
		// массив ДНК
		this.DNA = []
		
		// пригодность особи
		this.suitability = 0
	}
}

// популяция
class Population {
	
	// конструктор класса
	constructor(options) {
		
		// исходная популяция
		this.indvs = []
		
		// родительские пары
		this.parents = []
		
		// потомки
		this.children = []
		
		// промежуточный массив
		this.middleArray = []
		
		// параметры
		this.options = options
		
		// функция присвоения ID особи
		this.functionID = options.functionID
		
		// тип отбора
		this.typeSelection = options.typeSelection || 'roulette-wheel'
		
		// функция вычисления пригодности
		this.calcSuitability = options.calcSuitability
		
		// порог пригодности
		this.limitSuitability = typeof options.limitSuitability === 'number'
			? options.limitSuitability : 0
		
		// тип подбора родителей
		this.typeSelectionParents = options.typeSelectionParents || 'panmixia'
		
		// тип рекомбинации
		this.typeRecombination = options.typeRecombination || 'discrete'
		
		// тип отбора в новую популяцию
		this.typeNewPopulation = options.typeNewPopulation || 'truncation'
		
		// возможные сообщения об ошибках
		this.messages = [
			'Не указан один или несколько параметров инициализации ДНК!',
			'Количество турниров не может быть меньше 1!',
			'Количество отборочных туров в турнире не может быть меньше 2!',
			'Количество особей в отборочном туре не может быть меньше 2!',
			'Количество вращений рулетки не может быть меньше 2!',
			'Количество родительских пар не может быть меньше 1!',
			'Порог разности генотипов не может быть меньше 0!',
			'Плотность мутации должна быть от 0.01 до 0.1!',
			'Вероятность мутации должна быть от 0.005 до 0.01!'
		]
		
		// инициализация числовых параметров
		this.initParameters()
	}
	
	// метод инициализации числовых параметров
	initParameters() {
		
		// карта параметров
		let parameters = new Map([
			['countIndvs', [2, Infinity]], ['countTournaments', [1, Infinity]],
			['countTours', [2, Infinity]], ['sizeTour', [2, Infinity]],
			['countAttempts', [2, Infinity]], ['countCouples', [1, Infinity]],
			['limitDifference', [0, Infinity]], ['densityMutation', [0.01, 0.99]],
			['chanceMutation', [0.01, 0.99]]
		])
		
		// перебор параметров
		parameters.forEach((value, key) => {
			
			// условие
			let condition = this.options[key] && this.options[key] >= value[0] && this.options[key] <= value[1]
			
			// инициализация свойства
			this[key] = condition ? this.options[key] : value[0]
		})
		
		// инициализация особей
		this.initIndvs()
	}
	
	// сообщение об ошибке
	errorMessage(condition, message) {
		
		// если условие соблюдено
		if (condition) {
			
			// вывод сообщения
			console.log(message)
			
			// возврат "true"
			return true
		}
	}
	
	// инициализация особей
	initIndvs() {
		
		// перебор особей
		for (let i = 0; i < this.countIndvs; i++) {
			
			// инициализация
			this.indvs.push(new Individual(this.functionID()))
		}
	}
	
	// инициализация ДНК
	initDNA(options) {
		
		// переменная проверки
		let check
		
		// перебор параметров функции
		for (let key in options) {
			
			// если не число
			if (typeof options[key] !== 'number') check = true
		}
		
		// проверка на ошибки
		if (this.errorMessage(check, this.messages[0])) return
		
		// перебор особей
		this.indvs.forEach(indv => {
			
			// перебор хромосом
			for (let i = 0; i < options.count; i++) {
				
				// вставка рандомного значения
				indv.DNA.push(random(options.min, options.max, 0))
			}
		})
	}
	
	// отбор приспособленных особей
	selection() {
		
		// массив выбранных особей
		let selected = []
		
		// вычисление пригодности каждой особи
		this.indvs.forEach(indv => indv.suitability = this.calcSuitability(indv))
		
		// турнирный отбор
		if (this.typeSelection === 'tournament') {
			
			// проверка на ошибки
			if (this.errorMessage(this.countTournaments < 1, this.messages[1])) return
			
			if (this.errorMessage(this.countTours < 2, this.messages[2])) return
			
			if (this.errorMessage(this.sizeTour < 2, this.messages[3])) return
			
			// перебор турниров
			for (let i = 0; i < this.countTournaments; i++) {
				
				// перебор отборочных туров
				for (let j = 0; j < this.countTours; j++) {
					
					// массив отборочного тура
					let tour = []
					
					// перебор особей
					for (let k = 0; k < this.sizeTour; k++) {
						
						// отбор из популяции
						if (i === 0) tour.push(this.indvs[Math.floor(Math.random() * this.indvs.length)])
						
						// отбор из выбранных
						if (i > 0) tour.push(selected[Math.floor(Math.random() * selected.length)])
					}
					
					// поиск особи с наибольшей пригодностью
					selected.push(tour.reduce((prev, curr) => prev.suitability > curr.suitability ? prev : curr))
					
					// очистка отборочного тура
					tour = []
				}
			}
			
			// завершение функции
			return
		}
		
		// рулеточный отбор
		if (this.typeSelection === 'roulette-wheel') {
			
			// проверка на ошибки
			if (this.errorMessage(this.countAttempts < 2, this.messages[4])) return
			
			// вычисление общей пригодности
			let sum = this.indvs.reduce((prev, curr) => prev.suitability + curr.suitability, 0)
			
			// вычисление шансов каждой особи
			let chances = this.indvs.map((indv) => round(indv.suitability / sum, 3))
			
			// запуск рулетки
			for (let i = 0; i < this.countAttempts; i++) {
				
				// случайное число
				let attempt = Math.random()
				
				// перебор особей
				for (let i = 1; i < this.indvs.length; i++) {
					
					// выбор особи
					if (attempt > chances[i - 1] && attempt < chances[i]) selected.push(this.indvs[i])
				}
			}
		}
	}
	
	// подбор родительских пар
	selectionParents() {
		
		// проверка на ошибки
		if (this.errorMessage(this.countCouples < 1, this.messages[5])) return
		
		// очистка массива родителей
		this.parents = []
		
		// панмиксия
		if (this.typeSelectionParents === 'panmixia') {
			
			// промежуточный массив
			let couple = []
			
			// цикл образования родительских пар
			for (let i = 0; i < this.countCouples; i++) {
				
				// выбор случайного родителя1
				couple.push(this.indvs[Math.floor(Math.random() * this.indvs.length)])
				
				// выбор случайного родителя2
				couple.push(this.indvs[Math.floor(Math.random() * this.indvs.length)])
				
				// добавление родительской пары
				this.parents.push(couple)
				
				// очистка промежуточного массива
				couple = []
			}
			
			// завершение функции
			return
		}
		
		// инбридинг и аутбридинг
		// проверка на ошибки
		if (this.errorMessage(this.limitDifference < 0, this.messages[6])) return
		
		// разность генотипов
		let difference = 0
		
		// счётчик родительских пар
		let currentCouples = 0
		
		// цикл образования родительских пар
		while (currentCouples < this.countCouples) {
			
			// переменные проверки на инбридинг/аутбридинг
			let inbreeding, outbreeding, check
			
			// проверка на наличие инбредных/аутбредных особей
			for (let i = 0; i < this.indvs.length - 1; i++) {
				
				for (let j = i + 1; j < this.indvs.length; j++) {
					
					// вычисление разности генотипов между текущей и предыдущей особями
					this.indvs[i].DNA.forEach((gene, index) => difference += Math.abs(gene - this.indvs[j].DNA[index]))
					
					// проверка на инбридинг
					inbreeding = this.typeSelectionParents === 'inbreeding' && difference <= this.limitDifference
					
					// проверка на аутбридинг
					outbreeding = this.typeSelectionParents === 'outbreeding' && difference >= this.limitDifference
					
					// если есть инбридинг/аутбридинг
					if (inbreeding || outbreeding) check = true
					
					// сброс разности генотипов
					difference = 0
				}
			}
			
			// случайная особь1
			let indv1 = this.indvs[Math.floor(Math.random() * this.indvs.length)]
			
			// случайная особь2
			let indv2 = this.indvs[Math.floor(Math.random() * this.indvs.length)]
			
			// если не одна и та же особь
			if (indv1 !== indv2) {
				
				// вычисление разности генотипов между случайными особями
				indv1.DNA.forEach((gene, index) => difference += Math.abs(gene - indv2.DNA[index]))
				
				// проверка на инбридинг
				inbreeding = this.typeSelectionParents === 'inbreeding' && difference <= this.limitDifference
				
				// проверка на аутбридинг
				outbreeding = this.typeSelectionParents === 'outbreeding' && difference >= this.limitDifference
				
				// если условие истинно или отсутствуют инбредные/аутбредные особи
				if (inbreeding || outbreeding || !check) {
					
					// добавление родительской пары
					this.parents.push(new Array(indv1, indv2))
					
					// +1 к счётчику
					currentCouples++
				}
				
				// сброс разности генотипов
				difference = 0
			}
		}
	}
	
	// рекомбинация
	recombination() {
		
		// очистка массива потомков
		this.children = []
		
		// перебор родительских пар
		for (let parents of this.parents) {
			
			// инициализация новой особи
			let indv = new Individual(this.functionID())
			
			// перебор хромосом
			parents[0].DNA.forEach((gene, index) => {
				
				// дискретная рекомбинация
				if (this.typeRecombination === 'discrete') {
					
					// вычисление значения гена
					indv.DNA.push(Math.random() < 0.5 ? gene : parents[1].DNA[index])
				}
				
				// промежуточная рекомбинация
				if (this.typeRecombination === 'intermediate') {
					
					// модификатор промежуточной рекомбинации
					let alpha = random(-0.25, 1.25, 2)
					
					// вычисление значения гена
					indv.DNA.push(Math.round(gene + alpha * (parents[1].DNA[index] - gene)))
				}
				
				// линейная рекомбинация
				if (this.typeRecombination === 'linear') {
					
					// модификатор линейной рекомбинации
					let alpha = Math.random() * 1.5 - 0.25
					
					// вычисление значения гена
					indv.DNA.push(Math.round(gene + alpha * (parents[1].DNA[index] - gene)))
				}
				
				// мутация
				// проверка на ошибки
				if (this.errorMessage(this.densityMutation < 0.01
					|| this.densityMutation > 0.99, this.messages[7])) return
				
				if (this.errorMessage(this.chanceMutation < 0.01
					|| this.chanceMutation > 0.99, this.messages[8])) return
				
				// бросок на возможность мутации гена
				if (Math.random() < this.densityMutation) {
					
					// бросок на мутацию гена
					let attempt = Math.random() < this.chanceMutation
					
					// бросок на направление мутации гена
					if (attempt) indv.DNA[index] = Math.random() < 0.5
						? --indv.DNA[index] : ++indv.DNA[index]
				}
			})
			
			// вычисление пригодности потомка
			indv.suitability = this.calcSuitability(indv)
			
			// добавление в массив потомков
			this.children.push(indv)
		}
	}
	
	// отбор особей в новую популяцию
	newPopulation() {
		
		// промежуточный массив особей
		this.middleArray = this.indvs.concat(...this.children)
		
		// фильтрация промежуточного массива
		this.middleArray = this.middleArray.filter(indv => indv.suitability > this.limitSuitability)
		
		// повторное заполнение промежуточного массива
		if (this.middleArray.length < this.countIndvs) this.middleArray = this.indvs.concat(...this.children)
		
		// если промежуточный массив заполнен
		if (this.middleArray.length > 0) {
			
			// сортировка промежуточного массива
			this.middleArray = this.middleArray.sort((indv1, indv2) => indv1.suitability - indv2.suitability)
		}
		
		// очистка популяции
		this.indvs = []
		
		// если отбор усечением
		if (this.typeNewPopulation === 'truncation') {
			
			// цикл усечения
			while (this.indvs.length < this.countIndvs) {
				
				// индекс случайной пригодной особи
				let index = Math.floor(Math.random() * this.middleArray.length)
				
				// добавление в новую популяцию
				this.indvs.push(this.middleArray[index])
			}
		}
		
		// если элитарный отбор
		if (this.typeNewPopulation === 'elite') {
			
			// цикл отбора пригодных особей
			while (this.indvs.length < this.countIndvs) {
				
				// добавление элитной особи в новую популяцию
				this.indvs.push(this.middleArray.pop())
			}
		}
		
		// если отбор вытеснением
		if (this.typeNewPopulation === 'displacement') {
			
			// проверка на ошибки
			if (this.errorMessage(this.limitDifference < 0, this.messages[6])) return
			
			// цикл вытеснения похожих особей
			while (this.indvs.length < this.countIndvs) {
				
				// разность генотипов
				let difference = 0
				
				// переменная проверки
				let check = false
				
				// проверка на наличие разных особей
				for (let i = 0; i < this.middleArray.length - 1; i++) {
					
					for (let j = i + 1; j < this.middleArray.length; j++) {
						
						// перебор хромосом
						this.middleArray[i].DNA.forEach((gene, index) => {
							
							// вычисление разности генотипов между текущей и предыдущей особями
							difference += Math.abs(gene - this.middleArray[j].DNA[index])
						})
						
						// если разница больше порога
						if (difference > this.limitDifference) check = true
						
						// сброс разности генотипов
						difference = 0
					}
				}
				
				// индекс случайной особи1
				let index1 = Math.floor(Math.random() * this.middleArray.length)
				
				// индекс случайной особи2
				let index2 = Math.floor(Math.random() * this.middleArray.length)
				
				// случайная особь1
				let indv1 = this.middleArray[index1]
				
				// случайная особь2
				let indv2 = this.middleArray[index2]
				
				// вычисление разности генотипов
				indv1.DNA.forEach((gene, index) => difference += Math.abs(gene - indv2.DNA[index]))
				
				// если разность генотипов ниже порога или отсутствуют разные особи
				if (difference < this.limitDifference || !check) {
					
					// если бросок на вытеснение удачный
					if (Math.random() < 0.5) {
						
						// добавление особи1
						this.indvs.push(this.middleArray[index1])
						
					// если неудачный
					} else {
						
						// добавление особи2
						this.indvs.splice(this.middleArray[index2])
					}
				}
			}
		}
	}
	
	// метод фитнеса популяции
	fitness() {
		
		// начальный отбор
		this.selection()
		
		// отбор родителей
		this.selectionParents()
		
		// рекомбинация
		this.recombination()
		
		// отбор в новую популяцию
		this.newPopulation()
	}
}