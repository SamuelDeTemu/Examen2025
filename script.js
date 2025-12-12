const ExamApp = (() => {
  const STORAGE_KEY = "examenEticaContador";
  const PASSWORD_ALUMNO = "alumno";
  const PASSWORD_DOCENTE = "examen2025";
  const EXAM_DURATION_SECONDS = 20 * 60; // 20 minutos

  // Estado interno
  let contadorIntentos = 1;
  let studentName = "";
  let currentQuestionIndex = 0;
  let answers = [];
  let score = 0;
  let timerInterval = null;
  let remainingSeconds = EXAM_DURATION_SECONDS;
  let examFinished = false;

  // Elementos del DOM
  let startScreen,
    nameScreen,
    examScreen,
    resultScreen,
    alumnoAccess,
    docenteAccess,
    alumnoError,
    docenteStartError,
    docenteFinalError,
    nameError,
    infoIntentos,
    studentNameLabel,
    questionCounter,
    questionText,
    optionsForm,
    questionFeedback,
    timerBar,
    timerDisplay,
    summaryList,
    resultStudentName,
    resultScore,
    resultMessage,
    btnAlumnoLogin,
    btnDocenteLoginStart,
    btnStartExam,
    btnSubmitAnswer,
    btnNextQuestion,
    btnDocenteUnlockFinal;

  // Preguntas (PLACEHOLDER: sustituir por las del Word)
  const questions = [
    {
      id: 1,
      text: "La ética profesional del docente se refiere principalmente a:",
      options: [
        "La habilidad para memorizar leyes educativas.",
        "El conjunto de principios que orientan su actuación responsable en el ejercicio de la docencia.",
        "Las normas administrativas de la escuela.",
        "La cantidad de cursos que tiene acreditados."
      ],
      correctIndex: 1,
      explanation:
        "La ética profesional se centra en los principios y valores que guían la práctica responsable del docente."
    },
    {
      id: 2,
      text: "Un ejemplo de falta ética en el ámbito educativo es:",
      options: [
        "Preparar el material de clase con anticipación.",
        "Evaluar a todos los estudiantes con los mismos criterios.",
        "Revelar información confidencial de un estudiante sin necesidad.",
        "Promover la participación en clase."
      ],
      correctIndex: 2,
      explanation:
        "La confidencialidad es un principio ético fundamental; revelar información sin justificación es una falta grave."
    },
    {
      id: 3,
      text: "La responsabilidad del docente ante sus estudiantes implica:",
      options: [
        "Llegar tarde si ya compartió el material.",
        "Cumplir con la planeación, horarios y compromisos adquiridos.",
        "Solo impartir clases cuando haya supervisión.",
        "Delegar siempre las actividades a los estudiantes."
      ],
      correctIndex: 1,
      explanation:
        "La responsabilidad incluye cumplir con los tiempos, la planeación y los compromisos establecidos."
    },
    {
      id: 4,
      text: "El respeto a la diversidad en el aula significa:",
      options: [
        "Tratar mejor a los estudiantes con mejores calificaciones.",
        "Ignorar las diferencias culturales para que todos sean iguales.",
        "Reconocer y valorar las diferencias personales, culturales y de aprendizaje.",
        "Dejar que cada alumno haga lo que quiera."
      ],
      correctIndex: 2,
      explanation:
        "La ética profesional exige reconocer y valorar la diversidad, no ignorarla ni usarla para discriminar."
    },
    {
      id: 5,
      text: "Actuar con integridad como profesional de la educación implica:",
      options: [
        "Hacer excepciones en las reglas para algunos alumnos.",
        "Ser coherente entre lo que se enseña y lo que se practica.",
        "Cambiar de opinión según la presión de los padres.",
        "Buscar agradar a todos, incluso violando normas."
      ],
      correctIndex: 1,
      explanation:
        "La integridad consiste en la coherencia entre los valores que se enseñan y las acciones cotidianas."
    },
    {
      id: 6,
      text: "En el ámbito profesional, un conflicto de interés ocurre cuando:",
      options: [
        "El docente tiene varias materias asignadas.",
        "Las decisiones se ven influenciadas por beneficios personales o externos.",
        "El docente quiere seguir estudiando un posgrado.",
        "Se escuchan diferentes puntos de vista en clase."
      ],
      correctIndex: 1,
      explanation:
        "Un conflicto de interés sucede cuando intereses personales interfieren con el juicio profesional."
    },
    {
      id: 7,
      text: "El principio de justicia en ética profesional se relaciona con:",
      options: [
        "Dar más oportunidades solo a quien nos cae bien.",
        "Tratar con equidad y sin discriminación a las personas.",
        "Permitir favoritismos si nadie se da cuenta.",
        "Aplicar reglas distintas según la calificación."
      ],
      correctIndex: 1,
      explanation:
        "La justicia exige trato equitativo, sin privilegios ni discriminación injustificada."
    },
    {
      id: 8,
      text: "Una conducta ética frente a la evaluación de los alumnos es:",
      options: [
        "Aceptar regalos a cambio de mejorar calificaciones.",
        "Modificar calificaciones sin justificación para evitar conflictos.",
        "Usar criterios claros, comunicados previamente y aplicados por igual.",
        "Evaluar según la simpatía que genera cada estudiante."
      ],
      correctIndex: 2,
      explanation:
        "La ética en la evaluación implica criterios claros, transparentes y equitativos."
    },
    {
      id: 9,
      text: "La confidencialidad de la información del estudiante se rompe éticamente solo cuando:",
      options: [
        "Es un chisme interesante para otros docentes.",
        "Es necesario para proteger la integridad del propio estudiante u otras personas.",
        "Los padres de familia lo exigen siempre.",
        "Los compañeros de clase preguntan."
      ],
      correctIndex: 1,
      explanation:
        "Se puede compartir información solo cuando está en riesgo la integridad física o emocional del estudiante u otros."
    },
    {
      id: 10,
      text: "El compromiso social de la profesión docente implica:",
      options: [
        "Limitarse al aula sin interesarse por la comunidad.",
        "Contribuir a la formación integral de ciudadanos responsables y críticos.",
        "Solo enseñar contenidos memorísticos.",
        "Mantenerse neutral frente a cualquier problema social."
      ],
      correctIndex: 1,
      explanation:
        "La docencia tiene un compromiso con la formación de ciudadanos críticos, responsables y participativos."
    },
    {
      id: 11,
      text: "Un ejemplo de conducta no ética del docente con sus colegas es:",
      options: [
        "Compartir materiales y estrategias didácticas.",
        "Hablar mal de ellos frente a los estudiantes y desacreditarlos.",
        "Reconocer sus aportes en proyectos comunes.",
        "Colaborar en equipos académicos."
      ],
      correctIndex: 1,
      explanation:
        "Desacreditar a los colegas afecta el clima institucional y vulnera el respeto profesional."
    },
    {
      id: 12,
      text: "La bioética aplicada a la educación se relaciona, entre otros aspectos, con:",
      options: [
        "El uso responsable de tecnologías que involucren datos personales.",
        "Sólo con experimentos en laboratorios médicos.",
        "Exclusivamente con temas de ingeniería genética.",
        "El diseño de uniformes escolares."
      ],
      correctIndex: 0,
      explanation:
        "La bioética también se vincula al uso ético de la información y la tecnología en contextos educativos."
    },
    {
      id: 13,
      text: "La autonomía del estudiante debe ser promovida por el docente cuando:",
      options: [
        "Le resuelve todas las tareas para evitar que se equivoque.",
        "Fomenta la toma de decisiones responsables y el pensamiento crítico.",
        "Solo le dicta lo que debe memorizar.",
        "Le impone una única forma de aprender."
      ],
      correctIndex: 1,
      explanation:
        "Promover la autonomía significa ayudar al estudiante a decidir, reflexionar y aprender de forma activa."
    },
    {
      id: 14,
      text: "El uso ético de las TIC en el aula implica:",
      options: [
        "Plagiar materiales de internet sin citar la fuente.",
        "Compartir datos personales de los estudiantes en redes sociales.",
        "Utilizar recursos digitales respetando derechos de autor y privacidad.",
        "Permitir el ciberacoso si es entre alumnos."
      ],
      correctIndex: 2,
      explanation:
        "Las TIC deben usarse respetando derechos de autor, privacidad y bienestar de los estudiantes."
    },
    {
      id: 15,
      text: "El código de ética profesional sirve para:",
      options: [
        "Ser un documento decorativo en la escuela.",
        "Orientar la conducta profesional y establecer criterios de actuación.",
        "Sustituir todas las leyes laborales.",
        "Evitar que los docentes opinen."
      ],
      correctIndex: 1,
      explanation:
        "El código de ética orienta y regula la actuación profesional, no es solo algo simbólico."
    },
    {
      id: 16,
      text: "Cuando un docente reconoce un error frente al grupo:",
      options: [
        "Pierde toda autoridad.",
        "Fortalece la confianza y modela la honestidad.",
        "Debe ocultarlo para mantener respeto.",
        "Es señal de debilidad profesional."
      ],
      correctIndex: 1,
      explanation:
        "Reconocer errores muestra honestidad, humildad y fortalece la confianza del grupo."
    },
    {
      id: 17,
      text: "El principio de beneficencia en el contexto educativo se refiere a:",
      options: [
        "Buscar siempre el mayor beneficio y bienestar para los estudiantes.",
        "Solo cumplir con el programa oficial.",
        "No involucrarse con las necesidades del alumnado.",
        "Favorecer a algunos para que destaquen."
      ],
      correctIndex: 0,
      explanation:
        "La beneficencia implica procurar el bien del estudiante y evitar acciones que le perjudiquen."
    },
    {
      id: 18,
      text: "Un ejemplo de discriminación en el aula sería:",
      options: [
        "Brindar apoyos diferenciados según las necesidades.",
        "Excluir a un alumno por su origen étnico o condición socioeconómica.",
        "Ajustar actividades para estudiantes con dificultades.",
        "Escuchar distintas opiniones en clase."
      ],
      correctIndex: 1,
      explanation:
        "Excluir o tratar desfavorablemente por motivos de origen, género u otros es una forma clara de discriminación."
    },
    {
      id: 19,
      text: "La formación continua del docente, desde la ética profesional, es:",
      options: [
        "Opcional, solo si la escuela lo obliga.",
        "Un compromiso permanente para mejorar la práctica y el servicio educativo.",
        "Solo necesaria al inicio de la carrera.",
        "Irrelevante si ya tiene título."
      ],
      correctIndex: 1,
      explanation:
        "La ética profesional invita a actualizarse constantemente para ofrecer una mejor educación."
    },
    {
      id: 20,
      text: "La relación ética con las familias de los estudiantes debe basarse en:",
      options: [
        "La imposición de decisiones sin diálogo.",
        "La comunicación respetuosa, clara y colaborativa.",
        "Evitar cualquier contacto para no involucrarse.",
        "Criticar a los estudiantes frente a sus padres."
      ],
      correctIndex: 1,
      explanation:
        "La relación con las familias debe ser respetuosa, clara y orientada a colaborar por el bienestar del estudiante."
    }
  ];

  // ---------- Utilidades ----------

  function getOrInitContador() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        localStorage.setItem(STORAGE_KEY, "1");
        return 1;
      }
      const val = parseInt(stored, 10);
      if (Number.isNaN(val)) {
        localStorage.setItem(STORAGE_KEY, "1");
        return 1;
      }
      return val;
    } catch (e) {
      // Si falla localStorage, asumimos 1 simplemente.
      return 1;
    }
  }

  function setContador(value) {
    contadorIntentos = value;
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch (e) {
      // ignorar
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const mm = m < 10 ? "0" + m : String(m);
    const ss = s < 10 ? "0" + s : String(s);
    return `${mm}:${ss}`;
  }

  function showSection(sectionToShow) {
    [startScreen, nameScreen, examScreen, resultScreen].forEach((sec) => {
      if (!sec) return;
      if (sec === sectionToShow) sec.classList.remove("hidden");
      else sec.classList.add("hidden");
    });
  }

  function resetExamState() {
    currentQuestionIndex = 0;
    answers = new Array(questions.length).fill(null);
    score = 0;
    examFinished = false;
    remainingSeconds = EXAM_DURATION_SECONDS;
    updateTimerDisplay();
    stopTimer();
  }

  function startTimer() {
    timerBar.classList.remove("hidden");
    timerBar.classList.remove("timer-warning-5", "timer-warning-1");

    timerInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds < 0) remainingSeconds = 0;
      updateTimerDisplay();

      if (remainingSeconds === 5 * 60) {
        timerBar.classList.add("timer-warning-5");
      } else if (remainingSeconds === 60) {
        timerBar.classList.remove("timer-warning-5");
        timerBar.classList.add("timer-warning-1");
      }

      if (remainingSeconds <= 0) {
        stopTimer();
        lockExamTimeOver();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    if (timerDisplay) {
      timerDisplay.textContent = formatTime(remainingSeconds);
    }
  }

  // ---------- Flujo de inicio ----------

  function updateStartViewByContador() {
    infoIntentos.textContent =
      contadorIntentos >= 2
        ? "Estado: El examen ya se ha contestado al menos una vez en este navegador. Se requiere contraseña de docente para nuevos intentos."
        : "Estado: Primer intento disponible para el alumno.";

    if (contadorIntentos === 1) {
      alumnoAccess.classList.remove("hidden");
      docenteAccess.classList.add("hidden");
    } else {
      // contador >= 2
      alumnoAccess.classList.add("hidden");
      docenteAccess.classList.remove("hidden");
    }
  }

  // ---------- Manejo de accesos ----------

  function handleAlumnoLogin() {
    alumnoError.textContent = "";
    const pwd = document.getElementById("alumno-password").value.trim();

    if (!pwd) {
      alumnoError.textContent = "Por favor, introduce la contraseña de alumno.";
      return;
    }

    if (pwd !== PASSWORD_ALUMNO) {
      alumnoError.textContent = "Contraseña incorrecta.";
      return;
    }

    // Al iniciar examen por primera vez o nuevo intento:
    if (contadorIntentos < 2) {
      setContador(2); // ya se considera contestado al menos una vez
    } else {
      // Si se usa como bandera de múltiples intentos, podemos incrementar o mantener.
      // Aquí lo incrementamos como contador de intentos totales:
      setContador(contadorIntentos + 1);
    }

    // Limpiar campo
    document.getElementById("alumno-password").value = "";
    alumnoError.textContent = "";

    // Pasar a pantalla de nombre
    showSection(nameScreen);
  }

  function handleDocenteLoginStart() {
    docenteStartError.textContent = "";
    const pwd = document
      .getElementById("docente-password-start")
      .value.trim();

    if (!pwd) {
      docenteStartError.textContent = "Introduce la contraseña de docente.";
      return;
    }

    if (pwd !== PASSWORD_DOCENTE) {
      docenteStartError.textContent = "Contraseña de docente incorrecta.";
      return;
    }

    // Desbloqueo docente: ahora pedimos contraseña de alumno nuevamente
    document.getElementById("docente-password-start").value = "";
    docenteStartError.textContent = "";

    alumnoAccess.classList.remove("hidden");
    docenteAccess.classList.add("hidden");
    infoIntentos.textContent =
      "El examen ha sido desbloqueado por el docente. Ahora el alumno debe introducir su contraseña para iniciar.";
  }

  function handleDocenteUnlockFinal() {
    docenteFinalError.textContent = "";
    const pwd = document
      .getElementById("docente-password-final")
      .value.trim();

    if (!pwd) {
      docenteFinalError.textContent = "Introduce la contraseña de docente.";
      return;
    }

    if (pwd !== PASSWORD_DOCENTE) {
      docenteFinalError.textContent = "Contraseña de docente incorrecta.";
      return;
    }

    document.getElementById("docente-password-final").value = "";
    docenteFinalError.textContent = "";

    // Después de desbloquear, volvemos a la pantalla de inicio
    resetExamState();
    showSection(startScreen);
    updateStartViewByContador(); // ya mostrará flujo para docente o alumno según contador
  }

  // ---------- Manejo del nombre ----------

  function handleStartExam() {
    nameError.textContent = "";
    const nameInput = document.getElementById("student-name");
    const name = nameInput.value.trim();

    if (!name) {
      nameError.textContent = "Por favor, escribe tu nombre.";
      return;
    }

    studentName = name;
    nameInput.value = "";
    nameError.textContent = "";

    studentNameLabel.textContent = `Alumno: ${studentName}`;
    resetExamState();
    renderQuestion();
    showSection(examScreen);
    startTimer();
  }

  // ---------- Preguntas y respuestas ----------

  function renderQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.textContent = q.text;
    questionCounter.textContent = `Pregunta ${currentQuestionIndex + 1} de ${
      questions.length
    }`;

    optionsForm.innerHTML = "";
    questionFeedback.textContent = "";
    questionFeedback.classList.remove("correct", "incorrect");

    q.options.forEach((opt, idx) => {
      const label = document.createElement("label");
      label.className = "option-item";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "option";
      radio.value = idx;

      // Si ya respondió esta pregunta, marcamos y deshabilitamos
      if (answers[currentQuestionIndex] !== null) {
        radio.disabled = true;
        if (answers[currentQuestionIndex] === idx) {
          radio.checked = true;
        }
      }

      const textNode = document.createTextNode(opt);
      label.appendChild(radio);
      label.appendChild(textNode);
      optionsForm.appendChild(label);
    });

    btnNextQuestion.classList.add("hidden");
  }

  function handleSubmitAnswer() {
    if (examFinished) return;

    const selected = document.querySelector(
      '#options-form input[name="option"]:checked'
    );

    if (!selected) {
      questionFeedback.textContent = "Selecciona una opción antes de responder.";
      questionFeedback.classList.remove("correct", "incorrect");
      return;
    }

    const selectedIndex = parseInt(selected.value, 10);

    if (answers[currentQuestionIndex] !== null) {
      // Ya respondida: no re-calculamos
      return;
    }

    answers[currentQuestionIndex] = selectedIndex;

    const q = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === q.correctIndex;

    if (isCorrect) {
      score++;
      questionFeedback.textContent = "¡Correcto! " + q.explanation;
      questionFeedback.classList.remove("incorrect");
      questionFeedback.classList.add("correct");
    } else {
      questionFeedback.textContent = "Respuesta incorrecta. " + q.explanation;
      questionFeedback.classList.remove("correct");
      questionFeedback.classList.add("incorrect");
    }

    // Deshabilitar opciones después de responder
    const radios = document.querySelectorAll(
      '#options-form input[name="option"]'
    );
    radios.forEach((r) => (r.disabled = true));

    // Mostrar botón Siguiente o Finalizar
    if (currentQuestionIndex < questions.length - 1) {
      btnNextQuestion.textContent = "Siguiente pregunta";
      btnNextQuestion.classList.remove("hidden");
    } else {
      btnNextQuestion.textContent = "Ver resultados";
      btnNextQuestion.classList.remove("hidden");
    }
  }

  function handleNextQuestion() {
    if (examFinished) return;

    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      finalizeExam(false);
    }
  }

  // ---------- Finalización de examen ----------

  function lockExamTimeOver() {
    if (examFinished) return;
    examFinished = true;

    // Deshabilitamos controles y contamos lo que haya
    const radios = document.querySelectorAll(
      '#options-form input[name="option"]'
    );
    radios.forEach((r) => (r.disabled = true));
    btnSubmitAnswer.disabled = true;
    btnNextQuestion.disabled = true;

    finalizeExam(true);
  }

  function finalizeExam(timeOver) {
    if (examFinished && !timeOver) return;
    examFinished = true;

    stopTimer();
    timerBar.classList.add("hidden");

    // Calificación en base 10
    const total = questions.length;
    const finalScore = (score / total) * 10;
    const finalScoreRounded = Math.round(finalScore * 100) / 100;

    resultStudentName.textContent = `Alumno: ${studentName}`;
    resultScore.textContent = `Calificación: ${finalScoreRounded.toFixed(
      2
    )} / 10`;

    if (finalScoreRounded > 7) {
      resultMessage.textContent = `¡Felicidades, ${studentName}! Has obtenido una buena calificación. Sigue fortaleciendo tu compromiso ético como futuro profesional de la educación.`;
    } else {
      resultMessage.textContent = `${studentName}, aunque tu calificación puede mejorar, este resultado es una oportunidad para reforzar tus conocimientos y reflexionar sobre la importancia de la ética profesional. ¡No te desanimes, puedes hacerlo mejor!`;
    }

    // Construir resumen de respuestas
    summaryList.innerHTML = "";
    questions.forEach((q, idx) => {
      const li = document.createElement("li");
      const userAnswerIndex = answers[idx];
      const isCorrect = userAnswerIndex === q.correctIndex;

      const iconSpan = document.createElement("span");
      iconSpan.textContent = isCorrect ? "✔" : "✘";
      iconSpan.className = isCorrect
        ? "summary-correct"
        : "summary-incorrect";

      const textSpan = document.createElement("span");
      const userAns =
        userAnswerIndex !== null ? q.options[userAnswerIndex] : "Sin respuesta";
      const correctAns = q.options[q.correctIndex];

      textSpan.textContent = `P${idx + 1}: Tu respuesta: "${userAns}". Correcta: "${correctAns}".`;

      li.appendChild(iconSpan);
      li.appendChild(textSpan);
      summaryList.appendChild(li);
    });

    showSection(resultScreen);
  }

  // ---------- Inicialización ----------

  function cacheDomElements() {
    startScreen = document.getElementById("start-screen");
    nameScreen = document.getElementById("name-screen");
    examScreen = document.getElementById("exam-screen");
    resultScreen = document.getElementById("result-screen");

    alumnoAccess = document.getElementById("alumno-access");
    docenteAccess = document.getElementById("docente-access");

    alumnoError = document.getElementById("alumno-error");
    docenteStartError = document.getElementById("docente-start-error");
    docenteFinalError = document.getElementById("docente-final-error");
    nameError = document.getElementById("name-error");
    infoIntentos = document.getElementById("info-intentos");

    studentNameLabel = document.getElementById("student-name-label");
    questionCounter = document.getElementById("question-counter");
    questionText = document.getElementById("question-text");
    optionsForm = document.getElementById("options-form");
    questionFeedback = document.getElementById("question-feedback");

    timerBar = document.getElementById("timer-bar");
    timerDisplay = document.getElementById("timer-display");

    summaryList = document.getElementById("summary-list");
    resultStudentName = document.getElementById("result-student-name");
    resultScore = document.getElementById("result-score");
    resultMessage = document.getElementById("result-message");

    btnAlumnoLogin = document.getElementById("btn-alumno-login");
    btnDocenteLoginStart = document.getElementById("btn-docente-login-start");
    btnStartExam = document.getElementById("btn-start-exam");
    btnSubmitAnswer = document.getElementById("btn-submit-answer");
    btnNextQuestion = document.getElementById("btn-next-question");
    btnDocenteUnlockFinal = document.getElementById(
      "btn-docente-unlock-final"
    );
  }

  function attachEventListeners() {
    btnAlumnoLogin.addEventListener("click", handleAlumnoLogin);
    btnDocenteLoginStart.addEventListener("click", handleDocenteLoginStart);
    btnStartExam.addEventListener("click", handleStartExam);
    btnSubmitAnswer.addEventListener("click", handleSubmitAnswer);
    btnNextQuestion.addEventListener("click", handleNextQuestion);
    btnDocenteUnlockFinal.addEventListener("click", handleDocenteUnlockFinal);
  }

  function init() {
    cacheDomElements();
    attachEventListeners();

    contadorIntentos = getOrInitContador();
    updateStartViewByContador();
    updateTimerDisplay();
    showSection(startScreen);
  }

  // Exponer solo init
  return {
    init
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  ExamApp.init();
});
