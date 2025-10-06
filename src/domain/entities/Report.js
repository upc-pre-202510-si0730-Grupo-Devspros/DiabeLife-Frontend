export class Report {
    constructor({ id, name, date, type, data, selected = false, shared = false }) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.type = type;
        this.data = data;
        this.selected = selected;
        this.shared = shared;
    }

    static create({ name, date, type, data, selected, shared }) {
        return new Report({
            id: Date.now(),
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
