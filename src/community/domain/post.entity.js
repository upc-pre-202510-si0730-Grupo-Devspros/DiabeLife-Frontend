/**
 * Post Entity
 * Represents a post in the community or social feed domain.
 * @author Gabriel Mamani
 * @class
 * @property {number|null} id - The unique identifier of the post.
 * @property {number|null} authorId - The unique identifier of the user who created the post.
 * @property {string} content - The text content of the post.
 * @property {string|null} imageUrl - The URL of the image attached to the post (if any).
 * @property {string} username - The username of the post author.
 * @property {number} likes - The total number of likes the post has received.
 * @property {Array<Object>} comments - A list of comments associated with the post.
 * @property {Date} createdAt - The timestamp when the post was created.
 *
 * @example
 * const post = new PostEntity({
 *   id: 1,
 *   authorId: 5,
 *   content: "Hello everyone!",
 *   imageUrl: "https://example.com/image.jpg",
 *   username: "gabriel_mamani",
 *   likes: 10,
 *   comments: [{ user: "ana", text: "Nice post!" }],
 *   createdAt: new Date()
 * });
 * console.log(post.content); // "Hello everyone!"
 */


export class PostEntity {
    constructor({
                    id = null,
                    authorId = null,
                    content = "",
                    imageUrl = null,
                    username = "",

                    likes = 0,
                    comments = [],
                    createdAt = new Date(),
                } = {}) {
        this.id = id;
        this.authorId = authorId;
        this.content = content;
        this.imageUrl = imageUrl;
        this.username = username;
        this.likes = likes;
        this.comments = comments;
        this.createdAt = createdAt;
    }
}
