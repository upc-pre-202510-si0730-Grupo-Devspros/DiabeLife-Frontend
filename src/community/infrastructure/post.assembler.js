import { PostEntity } from "../domain/post.entity.js"

export class PostAssembler {

    static toEntityFromResource(resource) {
        return new PostEntity({
            id: resource.id ?? null,
            authorId: resource.authorId ?? null,
            content: resource.content ?? "",
            imageUrl: resource.imageUrl ?? null,
            likes: resource.likes ?? 0,
            comments: resource.comments ?? [],
            createdAt: resource.createdAt ? new Date(resource.createdAt) : new Date(),
        });
    }


    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }

        return (response.data || []).map(resource => this.toEntityFromResource(resource));
    }



    static toResourceFromEntity(entity) {
        const resource = {
            id: entity.id,
            authorId: entity.authorId,
            content: entity.content,
            imageUrl: entity.imageUrl,
            likes: entity.likes,
            comments: entity.comments,
            createdAt: entity.createdAt,
        };

        if (resource.id == null) {
            delete resource.id;
        }

        return resource;
    }
}
