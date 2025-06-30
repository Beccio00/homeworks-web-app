import dayjs from 'dayjs';

function Task(id, teach_id, question, answer, score, status, created_at) {
    this.id = id;
    this.teach_id = teach_id;
    this.question = question;
    this.answer = answer;
    this.score = score;
    this.status = status;
    this.created_at = dayjs(created_at);
}