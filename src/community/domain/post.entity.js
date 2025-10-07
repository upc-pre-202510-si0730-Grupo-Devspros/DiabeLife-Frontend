export class PostEntity {
    constructor({
                    id = null,
                    authorId = null,
                    content = "",
                    imageUrl = null,
                    likes = 0,
                    comments = [],
                    createdAt = new Date(),
                } = {}) {
        this.id = id;
        this.authorId = authorId;
        this.content = content;
        this.imageUrl = imageUrl;
        this.likes = likes;
        this.comments = comments;
        this.createdAt = createdAt;
    }
}
