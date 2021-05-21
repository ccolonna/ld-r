import GenericRepository from '../base/GenericRepository';
import PatternQueryBuilder from './PatternQueryBuilder';
import  { PatternInstance} from './PatternInstance'
import { VisualFrameRepository } from '../visualframes/VisualFrameRepository';

export class PatternInstanceRepository {
    constructor(dbClient, genericRepository, visualFrameRepository, patternQueryBuilder) {
        this.genericRepository = genericRepository || new GenericRepository(
            dbClient
        );
        this.visualFrameRepository = visualFrameRepository || new VisualFrameRepository()
        this.patternQueryBuilder = patternQueryBuilder || new PatternQueryBuilder();
    }
    async getPatternInstanceData(patternInstance) {
        if (patternInstance && patternInstance.pattern) {
            return this.genericRepository.fetchByQueryObject(
                this.patternQueryBuilder.getPatternInstanceDataQuery(patternInstance.uri, patternInstance.pattern.uri)
            )
        } else {
            return undefined
        }
    }

    async getPatternInstanceType(patternInstanceUri) {
        const pattern = await this.genericRepository.fetchByQueryObject(
            this.patternQueryBuilder.getPatternWithLabel(patternInstanceUri)
        );
        return pattern[0]
    }

    async getPatternInstanceWithTypeVisualFrameAndData(patternInstanceUri) {
        let pattern = await this.getPatternInstanceType(patternInstanceUri)
        let visualFrame = await this.visualFrameRepository.getVisualFrame(pattern.uri)
        const patternInstance = PatternInstance.create({uri: patternInstanceUri, pattern, visualFrame})
        let data = await this.getPatternInstanceData(patternInstance)
        patternInstance.data = data
        return patternInstance
    }
}
