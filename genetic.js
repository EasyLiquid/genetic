// *** СЛУЖЕБНЫЕ ФУНКЦИИ ***

// функция округления чисел
function round(_number, afterComma) {
	
	// возврат округлённого числа
	return parseFloat(_number.toFixed(afterComma))
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
		
		// функция присвоения ID особи
		this.functionID = options.functionID
		
		// тип отбора
		this.typeSelection = options.typeSelection || 'roulette-wheel'
		
		// функция вычисления пригодности
		this.calcSuitability = options.calcSuitability
		
		// количество турниров
		this.countTournaments = options.countTournaments && options.countTournaments >= 1
			? options.countTournaments : 1
		
		// количество отборочных туров
		this.countTours = options.countTours && options.countTours >= 2 ? options.countTours : 2
		
		// размер отборочного тура
		this.sizeTour = options.sizeTour && options.sizeTour >= 2 ? options.sizeTour : 2
		
		// количество вращений рулетки
		this.countAttempts = options.countAttempts && options.countAttempts >= 2
			? options.countAttempts : 2
		
		// тип подбора родителей
		this.typeSelectionParents = options.typeSelectionParents || 'panmixia'
		
		// количество родительских пар
		this.countCouples = options.countCouples && options.countCouples >= 1
			? options.countCouples : 1
		
		// порог разности генотипов
		this.limitDifference = options.limitDifference && options.limitDifference >= 0
			? options.limitDifference : 0
		
		// тип рекомбинации
		this.typeRecombination = options.typeRecombination || 'discrete'
		
		// плотность мутации
		this.densityMutation = options.densityMutation && options.densityMutation >= 0.01
			&& options.densityMutation <= 0.99 ? options.densityMutation : 0.5
		
		// вероятность мутации
		this.chanceMutation = options.chanceMutation && options.chanceMutation >= 0.01
			&& options.chanceMutation <= 0.99 ? options.chanceMutation : 0.5
		
		// тип отбора в новую популяцию
		this.typeNewPopulation = options.typeNewPopulation || 'truncation'
		
		// порог пригодности
		this.limitSuitability = options.limitSuitability && options.limitSuitability >= 0
			? options.limitSuitability : 0
		
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
	initIndvs(count) {
		
		// перебор особей
		for (let i = 0; i < count; i++) {
			
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
		if (errorMessage(check, this.messages[0])) return
		
		// перебор особей
		this.indvs.forEach(indv => {
			
			// перебор хромосом
			for (let i = 0; i < options.count; i++) {
				
				// вставка рандомного значения
				indv.DNA.push(Math.round(Math.random() * (options.max - options.min) + options.min))
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
			if (errorMessage(!this.countTournaments, this.messages[1])) return
			
			if (errorMessage(!this.countTours, this.messages[2])) return
			
			if (errorMessage(!this.sizeTour, this.messages[3])) return
			
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
			if (errorMessage(!this.countAttempts, this.messages[4])) return
			
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
		if (errorMessage(!this.countCouples, this.messages[5])) return
		
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
		if (errorMessage(!this.limitDifference, this.messages[6])) return
		
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
			
			// параметр линейной рекомбинации
			let alpha = Math.random() * 1.5 - 0.25
			
			// перебор хромосом
			for (let i = 0; i < parents[0].DNA.length; i++) {
				
				// дискретная
				if (this.typeRecombination === 'discrete') {
					
					// вычисление значения гена
					indv.DNA.push(Math.random() < 0.5 ? parents[0].DNA[i] : parents[1].DNA[i])
				}
				
				// промежуточная
				if (this.typeRecombination === 'intermediate') {
					
					// параметр промежуточной рекомбинации
					let alpha1 = Math.random() * 1.5 - 0.25
					
					// вычисление значения гена
					indv.DNA.push(Math.round(parents[0].DNA[i] + alpha1 * (parents[1].DNA[i] - parents[0].DNA[i])))
				}
				
				// линейная
				if (this.typeRecombination === 'linear') {
					
					// вычисление значения гена
					indv.DNA.push(Math.round(parents[0].DNA[i] + alpha * (parents[1].DNA[i] - parents[0].DNA[i])))
				}
				
				// мутация
				// проверка на ошибки
				if (errorMessage(!this.densityMutation, this.messages[7])) return
				
				if (errorMessage(!this.chanceMutation, this.messages[8])) return
				
				// бросок на возможность мутации гена
				if (Math.random() < this.densityMutation) {
					
					// бросок на мутацию гена
					indv.DNA[i] = Math.random() < this.chanceMutation ? ++indv.DNA[i] : --indv.DNA[i]
					
					// ограничения
					if (indv.DNA[i] > 10) indv.DNA[i] = 10
					
					if (indv.DNA[i] < 0) indv.DNA[i] = 0
				}
			}
			
			// вычисление пригодности потомка
			this.calcSuitability(indv)
			
			// добавление в массив потомков
			this.children.push(indv)
		}
	}
	
	// отбор особей в новую популяцию
	newPopulation() {
		
		// проверка на ошибки
		if (errorMessage(!this.limitSuitability, this.messages[6])) return
		
		// исходная численность популяции
		let countIndvs = this.indvs.length
		
		// объединение массива родителей с массивом потомков
		this.indvs = this.indvs.concat(...this.children)
		
		// очистка массива потомков
		this.children = []
		
		// отбор усечением
		if (this.typeNewPopulation === 'truncation') {
			
			// цикл усечения лишних особей
			while (this.indvs.length > countIndvs) {
				
				// массив непригодных особей
				let redundant = this.indvs.filter(indv => indv.suitability < this.limitSuitability)
				
				// индекс случайной непригодной особи
				let index
				
				// если непригодные особи присутствуют
				if (redundant.length > 0) index = Math.floor(Math.random() * redundant.length)
				
				// если непригодные особи отсутствуют
				if (redundant.length === 0) index = Math.floor(Math.random() * this.indvs.length)
				
				// удаление непригодной особи
				this.indvs.splice(index, 1)
			}
		}
		
		// элитарный отбор
		if (this.typeNewPopulation === 'elite') {
			
			// массив пригодных особей
			let selected = this.indvs.filter(indv => indv.suitability > this.limitSuitability)
			
			// промежуточный массив
			let middleArray = []
			
			// цикл отбора пригодных особей
			while (middleArray.length < countIndvs) {
				
				// переменная индекса
				let index
				
				// если пригодные особи присутствуют
				if (selected.length > 0) {
					
					// индекс случайной пригодной особи
					index = Math.floor(Math.random() * selected.length)
					
					// запись особи в промежуточный массив
					middleArray.push(selected[index])
				}
				
				// если пригодные особи отсутствуют
				if (selected.length === 0) {
					
					// индекс случайной пригодной особи
					index = Math.floor(Math.random() * this.indvs.length)
					
					// запись особи в промежуточный массив
					middleArray.push(this.indvs[index])
				}
			}
			
			// запись особей в исходную популяцию
			this.indvs = middleArray
		}
		
		// отбор вытеснением
		if (this.typeNewPopulation === 'displacement') {
			
			// цикл вытеснения похожих особей
			while (this.indvs.length > countIndvs) {
				
				// разность генотипов
				let difference = 0
				
				// переменная проверки
				let check = false
				
				// проверка на наличие разных особей
				for (let i = 0; i < this.indvs.length - 1; i++) {
					
					for (let j = i + 1; j < this.indvs.length; j++) {
						
						// перебор хромосом
						this.indvs[i].DNA.forEach((gene, index) => {
							
							// вычисление разности генотипов между текущей и предыдущей особями
							difference += Math.abs(gene - this.indvs[j].DNA[index])
						})
						
						// если разница больше порога
						if (difference > this.limitDifference) check = true
						
						// сброс разности генотипов
						difference = 0
					}
				}
				
				// индекс случайной особи1
				let index1 = Math.floor(Math.random() * this.indvs.length)
				
				// индекс случайной особи2
				let index2 = Math.floor(Math.random() * this.indvs.length)
				
				// случайная особь1
				let indv1 = this.indvs[index1]
				
				// случайная особь2
				let indv2 = this.indvs[index2]
				
				// вычисление разности генотипов
				indv1.DNA.forEach((gene, index) => difference += Math.abs(gene - indv2.DNA[index]))
				
				// если разность генотипов ниже порога или отсутствуют разные особи
				if (difference < this.limitDifference || !check) {
					
					// если бросок на вытеснение удачный
					if (Math.random() < 0.5) {
						
						// вытеснение особи1
						this.indvs.splice(index1, 1)
						
					// если неудачный
					} else {
						
						// вытеснение особи2
						this.indvs.splice(index2, 1)
					}
				}
				
				// сброс разности генотипов
				difference = 0
			}
		}
	}
}