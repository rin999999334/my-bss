import SwiftUI

struct AttackConfigEditor: View {
    @EnvironmentObject private var store: TeamStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Form {
            ForEach($store.attackConfigs) { $config in
                Section(store.team(with: config.attackerTeamID)?.displayName ?? "Unknown") {
                    Picker("Target", selection: $config.targetTeamID) {
                        ForEach(store.teams) { team in
                            Text(team.displayName).tag(team.id)
                        }
                    }
                    .pickerStyle(.menu)
                }
            }
        }
        .navigationTitle("Attack Routes")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Done") { dismiss() }
            }
        }
    }
}

#Preview {
    NavigationStack {
        AttackConfigEditor()
            .environmentObject(TeamStore())
    }
}
