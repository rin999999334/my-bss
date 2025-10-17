import AppIntents

struct TeamEntity: AppEntity {
    let id: UUID
    let name: String
    let emoji: String

    init(team: Team) {
        self.id = team.id
        self.name = team.name
        self.emoji = team.emoji
    }

    static var typeDisplayRepresentation: TypeDisplayRepresentation {
        "Team"
    }

    var displayRepresentation: DisplayRepresentation {
        if emoji.isEmpty {
            return .init(title: LocalizedStringResource(stringLiteral: name))
        } else {
            return .init(title: LocalizedStringResource(stringLiteral: name), subtitle: LocalizedStringResource(stringLiteral: emoji))
        }
    }

    static var defaultQuery = TeamQuery()
}

struct TeamQuery: EntityQuery {
    func entities(for identifiers: [UUID]) async throws -> [TeamEntity] {
        let store = TeamStore()
        return identifiers.compactMap { id in
            store.team(with: id).map(TeamEntity.init)
        }
    }

    func suggestedEntities() async throws -> [TeamEntity] {
        TeamStore().teams.map(TeamEntity.init)
    }

    func defaultResult() -> TeamEntity? {
        TeamStore().teams.first.map(TeamEntity.init)
    }
}

struct SelectBaseTeamIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Base Team"
    static var description = IntentDescription("Choose which team appears on the Sukumi widget.")

    @Parameter(title: "Team")
    var team: TeamEntity?

    static var parameterSummary: some ParameterSummary {
        Summary {
            \.$team
        }
    }
}
