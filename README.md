# Руководство

**genetic.js** — библиотека для упрощения работы с генетическими алгоритмами. Она написана с использованием учебно-методического пособия "Генетические алгоритмы" (Панченко Т.В.). На данный момент возможности библиотеки включают в себя:

* 2 типа отбора для составления родительских пар;
* 3 типа подбора родительских пар;
* 3 типа рекомбинации;
* 3 типа отбора в новую популяцию;
* плотность и вероятность мутации.

Все вышеперечисленные операторы имеют гибкую настройку.

## Инициализация и фитнес

Инициализировать популяцию можно следующим образом:

	let population = new Population({
		
		functionID: functionID, // функция присвоения ID особи (обязательный параметр)
		
		typeSelection: 'roulette-wheel', // тип отбора (по умолчанию 'roulette-wheel')
		
		calcSuitability: calcSuitability, // функция вычисления пригодности (обязательный параметр)
		
		countTournaments: 1, // количество турниров (по умолчанию 1)
		
		countTours: 2, // количество отборочных туров (по умолчанию 2)
		
		sizeTour: 2, // размер отборочного тура (по умолчанию 2)
		
		countAttempts: 2, // количество вращений рулетки (по умолчанию 2)
		
		typeSelectionParents: 'panmixia', // тип подбора родителей (по умолчанию 'panmixia')
		
		countCouples: 1, // количество родительских пар (по умолчанию 1)
		
		limitDifference: 0, // порог разности генотипов (по умолчанию 0)
		
		typeRecombination: 'discrete', // тип рекомбинации (по умолчанию 'discrete')
		
		densityMutation: 0.5, // плотность мутации (по умолчанию 0.5)
		
		chanceMutation: 0.5, // вероятность мутации (по умолчанию 0.5)
		
		typeNewPopulation: 'truncation', // тип отбора в новую популяцию (по умолчанию 'truncation')
		
		limitSuitability: 0 // порог пригодности (по умолчанию 0)
	})

Далее необходимо инициализировать особей и их ДНК:

	population.initIndvs(5) // метод принимает параметр "количество особей"
	
	population.initDNA({ // инициализация ДНК
		
		count: 3, // количество генов
		
		min: 1, // минимальное значение гена
		
		max: 10 // максимальное значение гена
	})

При желании можно сделать генотип особей двоичным (`min: 0` и `max: 1`). Однако методы кроссинговера (бинарной рекомбинации) сейчас в разработке.

Пример функции вычисления пригодности особи (параметр `suitability`):

	// параметры окружающей среды
	let p1 = Math.round(Math.random() * 10)
	let p2 = Math.round(Math.random() * 10)
	let p3 = Math.round(Math.random() * 10)

	let parameters = new Array(p1, p2, p3) // массив параметров

	let calcSuitability = indv => { // функция вычисления пригодности

		let sum = 0 // сумма пригодности
		
		indv.DNA.forEach((gene, index) => sum += parameters[index] - gene) // вычитание значения гена из параметра среды
		
		indv.suitability = round(sum, 2) // округление результата
	}

Встроенная утилита `round(_number, afterComma)` округляет значение числа, принимая первым параметром число, а вторым — количество знаков после запятой.

Пример функции присвоения ID особи:

	let functionID = () => {
		return Math.round(Math.random() * 10000)
	}

Функция фитнеса:

	function fitness() {
		
		population.selection() // запуск отбора для составления родительских пар
		
		population.selectionParents() // запуск подбора родительских пар
		
		population.recombination() // запуск рекомбинации и мутации
		
		population.newPopulation() // запуск отбора в новую популяцию
	}

## Операторы

Типы отбора для составления родительских пар (`selection`):

* "tournament" — особи становятся родителями по результатам отборочных туров;
* "roulette-wheel" — особи становятся родителями по результатам вращения рулетки; чем выше пригодность особи, тем выше её шансы стать родителем.

Типы подбора родительских пар `selectionParents`):

* "panmixia" — подбор производится случайным образом;
* "inbreeding" — особи становятся родителями, если разность генотипов ниже порога;
* "outbreeding" — особи становятся родителями, если разность генотипов выше порога.

Типы рекомбинации (`recombination`):

* "discrete" — потомки имеют случайные гены обоих родителей;
* "intermediate" — гены потомка вычисляются по формуле g1 + a * (g2 - g1), где g1 — ген первого родителя, g2 — ген второго родителя, a — множитель на интервале [-0,25; 1,25];
* "linear" — гены потомка вычисляются по аналогичной формуле с той лишь разницей, что множитель "a" одинаковый для всех генов.

Типы отбора в новую популяцию (`newPopulation`):

* "truncation" — удаляются случайные особи, не прошедшие порог пригодности;
* "elite" — в новую популяцию отбираются случайные особи, прошедшие порог пригодности;
* "displacement" — в новую популяцию отбираются особи, у которых разность генотипов выше порога.

**Плотность мутации** — условно говоря, это количество генов, к которым может быть применена мутация. Для каждого гена бросок сперва делается на возможность мутации и только затем — на мутацию непосредственно.

**Порог разности генотипов** — числовое значение, определяющее, насколько генотипы разных особей должны отличаться друг от друга при инбридинге, аутбридинге и отборе вытеснением.

## Планируемые изменения

* добавить возможность кроссинговера;
* добавить возможность комбинировать отбор, подбор и рекомбинации разных типов.

## Лицензия

MIT