import WidgetKit
import SwiftUI

struct SukumiWidgetEntry: TimelineEntry {
    let date: Date
    let configuration: SelectBaseTeamIntent
    let baseTeam: Team?
    let targetTeam: Team?
}

struct SukumiWidgetProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SukumiWidgetEntry {
        .init(
            date: .now,
            configuration: SelectBaseTeamIntent(),
            baseTeam: TeamSampleData.teams.first,
            targetTeam: TeamSampleData.teams.dropFirst().first
        )
    }

    func snapshot(for configuration: SelectBaseTeamIntent, in context: Context) async -> SukumiWidgetEntry {
        entry(for: configuration)
    }

    func timeline(for configuration: SelectBaseTeamIntent, in context: Context) async -> Timeline<SukumiWidgetEntry> {
        let entry = entry(for: configuration)
        return Timeline(entries: [entry], policy: .after(.now.addingTimeInterval(60 * 30)))
    }

    private func entry(for configuration: SelectBaseTeamIntent) -> SukumiWidgetEntry {
        let store = TeamStore()
        let selectedID = configuration.team?.id ?? store.baseTeamID ?? store.teams.first?.id
        let baseTeam = store.team(with: selectedID)
        let targetTeam = selectedID.flatMap { store.targetTeam(for: $0) }
        return .init(date: .now, configuration: configuration, baseTeam: baseTeam, targetTeam: targetTeam)
    }
}

struct SukumiWidgetEntryView: View {
    var entry: SukumiWidgetProvider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Sukumi Clash")
                .font(.headline)
            if let baseTeam = entry.baseTeam {
                Text(baseTeam.displayName)
                    .font(.title3)
                    .bold()
                if let target = entry.targetTeam {
                    Label {
                        Text("Targets \(target.displayName)")
                            .font(.subheadline)
                    } icon: {
                        Image(systemName: "scope")
                    }
                    .labelStyle(.titleAndIcon)
                } else {
                    Text("No target assigned")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                if !baseTeam.members.isEmpty {
                    Divider()
                    VStack(alignment: .leading, spacing: 4) {
                        ForEach(baseTeam.members.prefix(3)) { member in
                            Text(member.name)
                                .font(.caption)
                        }
                        if baseTeam.members.count > 3 {
                            Text("+\(baseTeam.members.count - 3) more")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            } else {
                Text("Select a base team in the widget settings.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .widgetBackground(Color(.systemBackground))
        .widgetURL(widgetURL)
    }

    private var widgetURL: URL? {
        guard let team = entry.baseTeam else { return nil }
        return URL(string: "sukumi://team/\(team.id.uuidString)")
    }
}

struct SukumiWidget: Widget {
    let kind: String = "SukumiWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: SelectBaseTeamIntent.self, provider: SukumiWidgetProvider()) { entry in
            SukumiWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Sukumi")
        .description("Keep track of who strikes who at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

#Preview(as: .systemSmall) {
    SukumiWidget()
} timeline: {
    SukumiWidgetEntry(
        date: .now,
        configuration: SelectBaseTeamIntent(),
        baseTeam: TeamSampleData.teams.first,
        targetTeam: TeamSampleData.teams.last
    )
}
