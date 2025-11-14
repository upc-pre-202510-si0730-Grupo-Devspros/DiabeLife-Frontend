export class Report {
    constructor({ id, name, date, type, data, selected = false, shared = false, userId, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.type = type;
        this.data = data;
        this.selected = selected;
        this.shared = shared;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static create({ name, date, type, data, selected, shared }) {
        return new Report({
            name,
            date,
            type,
            data,
            selected,
            shared
        });
    }

    toggleSelection() {
        this.selected = !this.selected;
        return this;
    }
}
