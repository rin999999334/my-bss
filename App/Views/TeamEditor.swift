import SwiftUI

struct TeamEditor: View {
    @Binding var team: Team
    @Environment(\.dismiss) private var dismiss
    @State private var newMemberName: String = ""

    var body: some View {
        Form {
            Section("Details") {
                TextField("Team Name", text: $team.name)
                TextField("Emoji", text: $team.emoji)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
            }

            Section("Members") {
                if team.members.isEmpty {
                    ContentUnavailableView(
                        "No Members",
                        systemImage: "person.3",
                        description: Text("Add members to build your squad.")
                    )
                } else {
                    ForEach($team.members) { $member in
                        TextField("Name", text: $member.name)
                    }
                    .onDelete { offsets in
                        team.members.remove(atOffsets: offsets)
                    }
                }

                HStack {
                    TextField("New Member", text: $newMemberName)
                    Button {
                        let trimmed = newMemberName.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        team.members.append(Member(name: trimmed))
                        newMemberName = ""
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(.accent)
                    }
                    .buttonStyle(.plain)
                    .disabled(newMemberName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .accessibilityLabel("Add member")
                }
            }
        }
        .navigationTitle(team.name.isEmpty ? "Team" : team.name)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") { dismiss() }
            }
        }
        .onDisappear {
            if team.name.isEmpty {
                team.name = "Untitled Team"
            }
        }
    }
}

#Preview {
    NavigationStack {
        TeamEditor(team: .constant(TeamSampleData.teams[0]))
    }
}
